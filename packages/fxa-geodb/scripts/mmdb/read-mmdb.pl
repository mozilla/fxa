#!/usr/bin/env perl

use strict;
use warnings;
use feature qw( say );

use Data::Printer;
use MaxMind::DB::Reader;

my $reader = MaxMind::DB::Reader->new( file => './cities-db.mmdb' );

my $record = $reader->record_for_address('63.245.221.32');

say np $record;
