#!/usr/bin/env python

"""
Prints github stats based on waffle labels set

Uses basic authentication (Github username + password) to retrieve Issues
from a repository that username has access to. Supports Github API v3.

Please set GIT_API_USER, GIT_API_KEY environment variables. You need a github api token.
"""

import argparse
import requests
import os
from datetime import datetime, timedelta

GITHUB_USER = os.environ['GIT_API_USER']
GITHUB_PASSWORD = os.environ['GIT_API_KEY']
GITHUB_ROOT_URL = 'https://api.github.com/repos/'
DAYS_PRIOR_DEFAULT = 30
SHORT_DAYS_PRIOR = 3
LONG_DAYS_PRIOR = 14
labels_filter = ['waffle:progress', 'waffle:now', 'waffle:review', 'waffle:next']
AUTH = (GITHUB_USER, GITHUB_PASSWORD)
repo = ""
milestone_filter = ""
days_prior = DAYS_PRIOR_DEFAULT
page_count = 0
pages_limit = 3

now = datetime.now()
search_date = now - timedelta(days=days_prior)
start_date = "%d-%d-%dT01:01:01Z" % (search_date.year, search_date.month, search_date.day)
print 'searching %s days back, since %s' % (days_prior, start_date)

one_day_prior = now - timedelta(days=SHORT_DAYS_PRIOR)
week_prior = now - timedelta(days=LONG_DAYS_PRIOR)

closed_long = []
closed_short = []
opened_long = []
opened_short = []
waffle_now_long = []
waffle_now_short = []
waffle_progress_long = []
waffle_progress_short = []
waffle_review_long = []
waffle_review_short = []
prs_short = []
prs_long = []
prs_closed_short = []
prs_closed_long = []

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

all_repos = all_content + all_auth
repos_default = all_content

def is_ascii(s):
    if all(ord(c) < 128 for c in s):
        return s
    else:
        return "hearts"

def _format_date(the_date):
    return datetime.strptime(the_date, "%Y-%m-%dT%H:%M:%SZ")
    # return the_date.split('T')[0]

def _print_issues(issues, _str, _days):
    print '%s - %s issues' % (_str, len(issues))
    for issue in issues:
        if 'pull' in issue['html_url']:
            assignee = issue['user']['login']
        else:
            assignee = issue['assignee']['login'] if issue['assignee'] is not None else ""
        print '<a href="%s">%s</a>, %s, %s' % (issue['html_url'], issue['number'], assignee, issue['title'].encode('utf-8'))
    print

def _push_waffle_events(event, issue):
    if _format_date(event['created_at']) > one_day_prior and event['label']['name'] == 'waffle:now':
        waffle_now_short.append(issue)
    if _format_date(event['created_at']) > week_prior and event['label']['name'] == 'waffle:now':
        waffle_now_long.append(issue)
    if _format_date(event['created_at']) > one_day_prior and event['label']['name'] == 'waffle:progress':
        waffle_progress_short.append(issue)
    if _format_date(event['created_at']) > week_prior and event['label']['name'] == 'waffle:progress':
        waffle_progress_long.append(issue)
    if _format_date(event['created_at']) > one_day_prior and event['label']['name'] == 'waffle:review':
        waffle_review_short.append(issue)
    if _format_date(event['created_at']) > week_prior and event['label']['name'] == 'waffle:review':
        waffle_review_long.append(issue)

def write_issues(resp):
    "output a list of issues to csv"
    if not resp.status_code == 200:
        raise Exception(resp.status_code)

    for issue in resp.json():
        #closed_at default
        closed_at = _format_date(issue['closed_at']) if issue['closed_at'] is not None else datetime.strptime('1970-01-01', '%Y-%m-%d')
        # updated_at = _format_date(issue['updated_at']) if issue['updated_at'] is not None else ""

        issue['events'] = requests.get(issue['events_url'], auth=AUTH).json()

        if not issue['events']:
            continue

        ##### PUSH create and closed into list for ISSUES
        if 'pull_request' in issue.keys():
            for event in issue['events']:
                # PUSH Waffle events into list
                if event['event'] == 'labeled' and event['label']['name'] in labels_filter:
                    if _format_date(event['created_at']) > one_day_prior:
                        prs_short.append(issue)
                    if _format_date(event['created_at']) > week_prior:
                        prs_long.append(issue)
                    if _format_date(event['created_at']) > one_day_prior and closed_at > one_day_prior:
                        prs_closed_short.append(issue)
                    if _format_date(event['created_at']) > week_prior and closed_at > week_prior:
                        prs_closed_long.append(issue)
                    _push_waffle_events(event, issue)
                    break

        else:
            for event in issue['events']:
                # PUSH Waffle events into list
                if event['event'] == 'labeled' and event['label']['name'] in labels_filter:
                    if _format_date(event['created_at']) > one_day_prior:
                        opened_short.append(issue)
                    if _format_date(event['created_at']) > week_prior:
                        opened_long.append(issue)
                    if _format_date(event['created_at']) > week_prior and closed_at > one_day_prior:
                        closed_short.append(issue)
                    if _format_date(event['created_at']) > week_prior and closed_at > week_prior:
                        closed_long.append(issue)
                    _push_waffle_events(event, issue)
                    break

def fetch_page(url):
    global page_count
    params = {} if start_date is not 0 else {"since": start_date}

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

        if page_count < pages_limit:
            page_count = page_count + 1
            fetch_page(pages['next'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-m", "--milestone", help = "filter for a specific milestone")
    parser.add_argument("-g", "--group_repos", help = "all_auth|all_content|all_repos")
    parser.add_argument("-r", "--repos", nargs='+', help = "list of repos", default=[])
    parser.add_argument("-s", "--status",  help = "status open|closed|all")
    parser.add_argument("-l", "--labels", nargs='+', help = "space delimited list of label strings, use no_label for all")
    parser.add_argument("-d", "--days_prior",  help = "default 90")

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

    if args.milestone:
        milestone_filter = args.milestone

    print ':: filtering on labels|status:', labels_filter, status

    for repo in repos:
        print 'repo:', repo

        issues_url = '%s%s/issues?state=%s' % (GITHUB_ROOT_URL, repo, status)
        fetch_page(issues_url)

    print
    print '::Last %s days::' % SHORT_DAYS_PRIOR
    _print_issues(prs_short, 'PRs OPENED', SHORT_DAYS_PRIOR)
    _print_issues(prs_closed_short, 'PRs CLOSED', SHORT_DAYS_PRIOR)
    _print_issues(opened_short, 'ISSUES OPENED', SHORT_DAYS_PRIOR)
    _print_issues(closed_short, 'ISSUES CLOSED', SHORT_DAYS_PRIOR)
    _print_issues(waffle_now_short, 'Moved into WAFFLE:NOW', SHORT_DAYS_PRIOR)
    _print_issues(waffle_progress_short, 'Moved into WAFFLE:PROGRESS', LONG_DAYS_PRIOR)
    _print_issues(waffle_review_short, 'Moved into WAFFLE:REVIEW', SHORT_DAYS_PRIOR)

    print '##################'
    print '::This Iteration:: - last %s days' % LONG_DAYS_PRIOR
    _print_issues(prs_long, 'PRs OPENED', LONG_DAYS_PRIOR)
    _print_issues(prs_closed_long, 'PRs CLOSED', LONG_DAYS_PRIOR)
    _print_issues(opened_long, 'ISSUES OPENED', LONG_DAYS_PRIOR)
    _print_issues(closed_long, 'ISSUES CLOSED', LONG_DAYS_PRIOR)
    _print_issues(waffle_now_long, 'Moved into WAFFLE:NOW', LONG_DAYS_PRIOR)
    _print_issues(waffle_progress_long, 'Moved into WAFFLE:PROGRESS', LONG_DAYS_PRIOR)
    _print_issues(waffle_review_long, 'Moved into WAFFLE:REVIEW', LONG_DAYS_PRIOR)
