#!/usr/bin/env python

"""
Exports Issues from a specified repository to a CSV file

Uses basic authentication (Github username + password) to retrieve Issues
from a repository that username has access to. Supports Github API v3.

creates a csv file with the same name as repo.
"""
import argparse
import csv
import requests
import os
import sys


GITHUB_USER = os.environ['GIT_API_USER']
GITHUB_PASSWORD = os.environ['GIT_API_KEY']
labels_filter = ['waffle:in progress', 'waffle:ready', 'waffle:in review']
AUTH = (GITHUB_USER, GITHUB_PASSWORD)

def write_issues(resp):
    "output a list of issues to csv"
    if not resp.status_code == 200:
        raise Exception(resp.status_code)
    for issue in resp.json():
        labels = issue['labels']
        for label in labels:
            if label['name'] in labels_filter:
                milestone = issue['milestone']['title'] if issue['milestone'] is not None else ""

                csvout.writerow([issue['number'],
                                 issue['title'].encode('utf-8'),
                                 issue['created_at'],
                                 issue['updated_at'],
                                 issue['state'],
                                 issue['user']['login'],
                                 milestone,
                                 label['name']])

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

        while 'last' in pages and 'next' in pages:
            print pages['next'], pages['last']
            if pages['next'] == pages['last']:
                sys.exit()

            fetch_page(pages['next'])

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-r", "--repo", help = "repo name")
    parser.add_argument("-s", "--status",  help = "status open|closed")
    parser.add_argument("-l", "--labels", nargs='+', help = "space delimited list of label strings")
    args = parser.parse_args()

    repo = args.repo if args.repo is not None else 'mozilla/fxa-auth-server'
    status = args.status if args.status is not None else 'open'
    if args.labels is not None:
        labels_filter = args.labels

    csvfile = '%s-issues.csv' % (repo.replace('/', '-'))
    csvout = csv.writer(open(csvfile, 'wb'))
    csvout.writerow(('ID', 'Title', 'Created At', 'Updated At', 'State', 'Assignee', 'Milestone', 'Waffle_state'))
    print repo, status, labels_filter

    issues_url = 'https://api.github.com/repos/%s/issues?state=%s' % (repo, status)
    fetch_page(issues_url)
