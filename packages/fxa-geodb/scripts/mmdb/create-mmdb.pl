#!/usr/bin/env perl

# This file creates a custom Maxmind mmdb that can be loaded by
# fxa-geodb. For testing purposes this only adds two IP addresses.
#
# Reference https://metacpan.org/pod/MaxMind::DB::Writer::Tree
# for more API details.

use MaxMind::DB::Writer::Tree;

my %types = (
    city => 'map',
    geoname_id => 'uint32',
    names => 'map',
    en => 'utf8_string',
    continent => 'map',
    country => 'map',
    iso_code => 'utf8_string',
    location => 'map',
    accuracy_radius => 'int32',
    latitude => 'double',
    longitude => 'double',
    metro_code => 'int32',
    time_zone => 'utf8_string',
    postal => 'map',
    code => 'int32',
    registered_country => 'map',
    subdivisions => ['array', 'map'],
);

my $tree = MaxMind::DB::Writer::Tree->new(
    ip_version            => 6,
    record_size           => 24,
    database_type         => 'FxA-IP-Data',
    languages             => ['en'],
    description           => { en => 'FxA database of IP data' },
    map_key_type_callback => sub { $types{ $_[0] } },
);

$tree->insert_network(
    '63.245.221.32/24',
    {
        city => {
            geoname_id => 5375480,
            names  => {
                en => 'Mountain View'
            }
        },
        continent => {
            geoname_id => 6255149,
            names => {
                en => 'North America'
            }
        },
        country => {
            geoname_id => 6252001,
            iso_code => 'US',
            names => {
                en => 'United States'
            }
        },
        location => {
            accuracy_radius => 50,
            latitude => 37.3897,
            longitude => -122.0832,
            metro_code => 807,
            time_zone => 'America/Los_Angeles'
        },
        postal => {
            code => 94041
        },
        subdivisions => [ {
            iso_code => 'CA',
            names => {
                en => 'California'
            }
        }, ]
    },
);

$tree->insert_network(
    '64.11.221.194/24',
    {
        continent => {
            geoname_id => 6255149,
            names => {
                en => 'North America'
            }
        },
        country => {
            geoname_id => 6252001,
            iso_code => 'US',
            names => {
                en => 'United States'
            }
        },
        location => {
            accuracy_radius => 50,
            latitude => 37.3897,
            longitude => -122.0832,
            metro_code => 807,
            time_zone => 'America/Chicago'
        },
    },
);

$tree->insert_network(
    '8.8.8.8/24',
    {
        continent => {
            geoname_id => 6255149,
            names => {
                en => 'North America'
            }
        },
        country => {
            geoname_id => 6252001,
            iso_code => 'US',
            names => {
                en => 'United States'
            }
        },
        location => {
            accuracy_radius => 50,
            latitude => 37.3897,
            longitude => -122.0832,
            metro_code => 807,
            time_zone => 'America/Chicago'
        },
    },
);

open my $fh, '>:raw', './cities-db.mmdb';
$tree->write_tree($fh);
