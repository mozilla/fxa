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


GITHUB_USER = os.environ['GIT_API_USER']
GITHUB_PASSWORD = os.environ['GIT_API_KEY']
labels_filter = ['waffle:in progress', 'waffle:ready', 'waffle:in review']
AUTH = (GITHUB_USER, GITHUB_PASSWORD)
repo = ""

# auth-server
# repos_default = ["mozilla/fxa-auth-db-mysql",
#                  "mozilla/fxa-auth-db-server",
#                  "mozilla/fxa-auth-mailer",
#                  "mozilla/fxa-auth-server",
#                  "mozilla/fxa-customs-server",
#                  "mozilla/fxa-dev",
#                  "mozilla/fxa-jwtool",
#                  "mozilla/fxa-notification-server",
#                  "mozilla/fxa-oauth-client",
#                  "mozilla/fxa-oauth-server",
#                  "mozilla/fxa-profile-server",
#                  "mozilla/hapi-fxa-oauth"]

#content-server
repos_default = ["mozilla/fxa-auth-mailer",
                 "mozilla/fxa-content-experiments",
                 "mozilla/fxa-content-server",
                 "mozilla/fxa-js-client",
                 "mozilla/fxa-oauth-console",
                 "mozilla/fxa-relier-client"]

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
        labels = issue['labels']
        label_list = [is_ascii(label['name']) for label in labels]
        # print label_list

        # check if label filter is in labels of an issue
        if [i for i in labels_filter if i in label_list]:
            milestone = issue['milestone']['title'] if issue['milestone'] is not None else ""
            csvout.writerow([repo,
                             issue['number'],
                             issue['title'].encode('utf-8'),
                             issue['created_at'],
                             issue['updated_at'],
                             issue['state'],
                             issue['user']['login'],
                             milestone,
                             ','.join(label_list)])

def fetch_page(url):
    r = requests.get(url, auth=AUTH)
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
    parser.add_argument("-r", "--repos", nargs='+', help = "list of repos")
    parser.add_argument("-s", "--status",  help = "status open|closed")
    parser.add_argument("-l", "--labels", nargs='+', help = "space delimited list of label strings")
    parser.add_argument("-f", "--file_name", help = "combine all data in a single file otherwise per repo files")
    args = parser.parse_args()

    repos = args.repos if args.repos is not None else repos_default
    status = args.status if args.status is not None else 'open'

    if args.labels is not None:
        labels_filter = args.labels
        print labels_filter

    if args.file_name:
        csvfile = args.file_name
        csvout = csv.writer(open(csvfile, 'a'))
        print 'created file:', csvfile
        csvout.writerow(('Repo', 'ID', 'Title', 'Created At', 'Updated At', 'State', 'Assignee', 'Milestone', 'Labels'))

    print ':: filtering on labels and status:', labels_filter, status

    for repo in repos:
        print 'repo:', repo
        if args.file_name is None:
            csvfile = '%s-issues.csv' % (repo.replace('/', '-'))
            csvout = csv.writer(open(csvfile, 'w'))
            print 'created file:', csvfile
            csvout.writerow(('Repo', 'ID', 'Title', 'Created At', 'Updated At', 'State', 'Assignee', 'Milestone', 'Labels'))

        issues_url = 'https://api.github.com/repos/%s/issues?state=%s' % (repo, status)
        fetch_page(issues_url)
