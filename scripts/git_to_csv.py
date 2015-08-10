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
import datetime


GITHUB_USER = os.environ['GIT_API_USER']
GITHUB_PASSWORD = os.environ['GIT_API_KEY']
DAYS_PRIOR_DEFAULT = 90
ROW_HEADERS = ('Repo', 'ID', 'Title', 'Created At', 'Updated At', 'Closed At', 'State', 'Reporter', 'Assignee', 'Milestone', 'Labels')
labels_filter = ['waffle:progress', 'waffle:now', 'waffle:review']
AUTH = (GITHUB_USER, GITHUB_PASSWORD)
repo = ""
milestone_filter = ""
days_prior = DAYS_PRIOR_DEFAULT

now = datetime.datetime.now() - datetime.timedelta(days=days_prior)
start_date = "%d-%d-%dT01:01:01Z" % (now.year, now.month, now.day)
print 'searching %s days back, since %s' % (days_prior, start_date)

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

repos_default = all_auth

def is_ascii(s):
    if all(ord(c) < 128 for c in s):
        return s
    else:
        return "hearts"

def write_issues(resp):
    "output a list of issues to csv"
    if not resp.status_code == 200:
        raise Exception(resp.status_code)

    for issue in resp.json():
        # filter out PRs
        if args.pull_requests_only:
            # PRs only
            if 'pull_request' not in issue.keys():
                continue
        else:
            # Issues only
            if 'pull_request' in issue.keys():
                continue

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
        closed_at = issue['closed_at'] if issue['closed_at'] is not None else ""

        #assignee default
        assignee = issue['assignee']['login'] if issue['assignee'] is not None else ""

        # labels filter
        labels = issue['labels']
        label_list = [is_ascii(label['name']) for label in labels]

        # check if label filter is in labels of an issue
        if 'no_label' not in labels_filter:
            if not [i for i in labels_filter if i in label_list]:
                continue

        # write to csv
        csvout.writerow([repo,
                        issue['number'],
                        issue['title'].encode('utf-8'),
                        issue['created_at'],
                        issue['updated_at'],
                        closed_at,
                        issue['state'],
                        issue['user']['login'],
                        assignee,
                        milestone,
                        ','.join(label_list)])

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
    parser.add_argument("-s", "--status",  help = "status open|closed")
    parser.add_argument("-l", "--labels", nargs='+', help = "space delimited list of label strings, use no_label for all")
    parser.add_argument("-f", "--file_name", help = "combine all data in a single file otherwise per repo files")
    parser.add_argument("-d", "--days_prior",  help = "default 90")
    parser.add_argument("-p", "--pull_requests_only", default=False, action='store_true', help = "default False")

    args = parser.parse_args()

    if args.group_repos:
        repos = eval(args.group_repos)
    else:
        repos = args.repos if args.repos is not None else repos_default

    status = args.status if args.status is not None else 'open'
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
