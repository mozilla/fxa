#!/usr/bin/env python

"""
Exports github issues from a repositories to a CSV file with specific labels

Uses basic authentication (Github username + password) to retrieve Issues
from a repository that username has access to. Supports Github API v3.

Please set GIT_API_USER, GIT_API_KEY environment variables. You need a github api token.
"""

import argparse
import csv
import requests
import os
from datetime import datetime, timedelta
from pprint import pprint

GITHUB_USER = os.environ['GIT_API_USER']
GITHUB_PASSWORD = os.environ['GIT_API_KEY']
DAYS_PRIOR_DEFAULT = 90
SHORT_DAYS_PRIOR = 1
LONG_DAYS_PRIOR = 14
ROW_HEADERS = ('Repo', 'ID', 'Title', 'Created At', 'Updated At', 'Closed At', 'State', 'Reporter', 'Assignee', 'Milestone', 'Labels')
labels_filter = ['waffle:progress', 'waffle:now', 'waffle:review', 'waffle:next']
AUTH = (GITHUB_USER, GITHUB_PASSWORD)
repo = ""
milestone_filter = ""
days_prior = DAYS_PRIOR_DEFAULT
model = []


now = datetime.now()
search_date = now - timedelta(days=days_prior)
start_date = "%d-%d-%dT01:01:01Z" % (search_date.year, search_date.month, search_date.day)
print 'searching %s days back, since %s' % (days_prior, start_date)

one_day_prior = now - timedelta(days=SHORT_DAYS_PRIOR)
week_prior = now - timedelta(days=LONG_DAYS_PRIOR)

closed_this_week = []
closed_yesterday = []
opened_this_week = []
opened_yesterday = []
waffle_now_this_week = []
waffle_now_yesterday = []
waffle_review_this_week = []
waffle_review_yesterday = []

repos_batch = ['all_auth', 'all_content']
# auth-server
all_auth = ["mozilla/fxa-auth-db-mysql",
            "mozilla/fxa-auth-db-server",
            "mozilla/fxa-auth-mailer",
            "mozilla/fxa-auth-server",
            "mozilla/fxa-customs-server",
            "mozilla/fxa-dev",
            "mozilla/fxa-jwtool",
            "mozilla/fxa-notification-server",
            "mozilla/fxa-oauth-client",
            "mozilla/fxa-oauth-server",
            "mozilla/fxa-profile-server",
            "mozilla/hapi-fxa-oauth"]

#content-server
all_content = ["mozilla/fxa-auth-mailer",
               "mozilla/fxa-content-experiments",
               "mozilla/fxa-content-server",
               "mozilla/fxa-js-client",
               "mozilla/fxa-oauth-console",
               "mozilla/fxa-relier-client"]

all_repos = all_auth.extend(all_content)
repos_default = all_auth

def is_ascii(s):
    if all(ord(c) < 128 for c in s):
        return s
    else:
        return "hearts"

def _format_date(the_date):
    return datetime.strptime(the_date, "%Y-%m-%dT%H:%M:%SZ")
    # return the_date.split('T')[0]

def _print_issues(issues, _str, _days):
    print '%s last %s days' % (_str, _days)
    print 'COUNT:', len(issues)
    for issue in issues:
        print '%s, %s' % (issue['url'], issue['title'].encode('utf-8'))

def write_issues(resp):
    "output a list of issues to csv"
    if not resp.status_code == 200:
        raise Exception(resp.status_code)

    for issue in resp.json():
        # filter out PRs
        # if args.pull_requests_only:
        #     # PRs only
        #     if 'pull_request' not in issue.keys():
        #         continue
        # else:
        #     # Issues only
        #     if 'pull_request' in issue.keys():
        #         continue

        #milestone filter
        if milestone_filter:
            if not issue['milestone']:
                continue
            milestone = issue['milestone'].get('title').lower().replace(" ", "-")
            if milestone != milestone_filter:
                continue
        else:
            milestone = issue['milestone']['title'] if issue['milestone'] is not None else ""

        #closed_at default
        closed_at = _format_date(issue['closed_at']) if issue['closed_at'] is not None else ""
        updated_at = _format_date(issue['updated_at']) if issue['updated_at'] is not None else ""

        #assignee default
        assignee = issue['assignee']['login'] if issue['assignee'] is not None else ""

        # labels filter
        labels = issue['labels']
        label_list = [is_ascii(label['name']) for label in labels]

        # check if label filter is in labels of an issue
        if 'no_label' not in labels_filter:
            if not [i for i in labels_filter if i in label_list]:
                continue

        # parse events for waffle label additions
        if issue['events_url']:
            events = requests.get(issue['events_url'], auth=AUTH).json()
            for event in events:
                # PUSH Waffle events into list
                if event['event'] == 'labeled' and event['label']['name'] == 'waffle:now':
                    if _format_date(event['created_at']) > one_day_prior:
                        waffle_now_yesterday.append(issue)
                    if _format_date(event['created_at']) > week_prior:
                        waffle_now_this_week.append(issue)

                if event['event'] == 'labeled' and event['label']['name'] == 'waffle:review':
                    if _format_date(event['created_at']) > one_day_prior:
                        waffle_review_yesterday.append(issue)
                    if _format_date(event['created_at']) > week_prior:
                        waffle_review_this_week.append(issue)


        ##### PUSH create and closed into list
        create_date = _format_date(issue['created_at'])
        if create_date > one_day_prior:
            opened_yesterday.append(issue)

        if create_date > week_prior:
            opened_this_week.append(issue)

        if closed_at:
            if closed_at > one_day_prior:
                closed_yesterday.append(issue)

            if closed_at > week_prior:
                closed_this_week.append(issue)

def fetch_page(url):
    params = {} if start_date is not 0 else {"since":start_date}

    r = requests.get(url, auth=AUTH, params=params)
    print 'fetch:', url
    write_issues(r)

    #handle pagination, check if we're on the last page otherwise fetch next page
    if 'link' in r.headers:
        pages = dict(
            [(rel[6:-1], url[url.index('<')+1:-1]) for url, rel in
                [link.split(';') for link in
                    r.headers['link'].split(',')]])

        if 'last' not in pages:
            return

        fetch_page(pages['next'])

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-m", "--milestone", help = "filter for a specific milestone")
    parser.add_argument("-g", "--group_repos", help = "all_auth|all_content")
    parser.add_argument("-r", "--repos", nargs='+', help = "list of repos", default=[])
    parser.add_argument("-s", "--status",  help = "status open|closed|all")
    parser.add_argument("-l", "--labels", nargs='+', help = "space delimited list of label strings, use no_label for all")
    parser.add_argument("-f", "--file_name", help = "combine all data in a single file otherwise per repo files")
    parser.add_argument("-d", "--days_prior",  help = "default 90")
    parser.add_argument("-p", "--pull_requests_only", default=False, action='store_true', help = "default False")

    args = parser.parse_args()

    if args.group_repos:
        repos = eval(args.group_repos)
    else:
        repos = args.repos if args.repos is not None else repos_default

    status = args.status if args.status is not None else 'all'
    days_prior = args.days_prior if args.days_prior is not None else DAYS_PRIOR_DEFAULT

    if args.labels is not None:
        labels_filter = args.labels
        print labels_filter

    if args.file_name:
        csvfile = args.file_name
        csvout = csv.writer(open(csvfile, 'a'))
        print 'created file:', csvfile
        csvout.writerow(ROW_HEADERS)

    if args.milestone:
        milestone_filter = args.milestone

    print ':: filtering on labels|status|milestone|prs only:', labels_filter, status, milestone_filter, args.pull_requests_only

    for repo in repos:
        print 'repo:', repo
        if args.file_name is None:
            csvfile = '%s-issues.csv' % (repo.replace('/', '-'))
            csvout = csv.writer(open(csvfile, 'wb'))
            print 'created file:', csvfile
            csvout.writerow(ROW_HEADERS)

        issues_url = 'https://api.github.com/repos/%s/issues?state=%s' % (repo, status)
        fetch_page(issues_url)
        # pprint (model)
        newlist = sorted(model, key=lambda k: k['created_at'])
        _print_issues(opened_yesterday, 'OPENED', SHORT_DAYS_PRIOR)
        _print_issues(opened_this_week, 'OPENED', LONG_DAYS_PRIOR)

        _print_issues(closed_yesterday, 'CLOSED', SHORT_DAYS_PRIOR)
        _print_issues(closed_this_week, 'CLOSED', LONG_DAYS_PRIOR)

        _print_issues(waffle_now_this_week, 'WAFFLE:NOW', SHORT_DAYS_PRIOR)
        _print_issues(waffle_now_yesterday, 'WAFFLE:NOW', LONG_DAYS_PRIOR)

        _print_issues(waffle_review_yesterday, 'WAFFLE:REVIEW', SHORT_DAYS_PRIOR)
        _print_issues(waffle_review_this_week, 'WAFFLE:REVIEW', LONG_DAYS_PRIOR)
