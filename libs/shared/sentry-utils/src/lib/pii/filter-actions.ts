/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CheckOnly, IFilterAction, PiiData } from '../models/pii';

/** Default replacement values */
export const FILTERED = '[Filtered]';
export const TRUNCATED = '[Truncated]';

/**
 * A filter that truncates anything over maxDepth. This is a good first action.
 */
export class DepthFilter implements IFilterAction {
  /**
   * Crete new depth filter.
   * @param maxDepth - The max depth allowed in the tree. The first level is considered is index as 0.
   */
  constructor(protected readonly maxDepth = 3) {}

  execute<T extends PiiData>(val: T, depth = 0) {
    let exitPipeline = false;

    if (val == null) {
      exitPipeline = true;
    } else if (depth > this.maxDepth && typeof val === 'object') {
      Object.keys(val)?.forEach((x) => {
        val[x] = TRUNCATED;
      });
      exitPipeline = true;
    }

    return { val, exitPipeline };
  }
}

/**
 * A filter truncates any object or array containing too many entries.
 */
export class BreadthFilter implements IFilterAction {
  /**
   * Create new breadth filter
   * @param maxBreadth max number of values in object / array
   */
  constructor(protected readonly maxBreadth: number) {}

  execute<T extends PiiData>(val: T) {
    let exitPipeline = false;

    if (val == null) {
      exitPipeline = true;
    } else if (typeof val === 'object') {
      if (val instanceof Array) {
        exitPipeline = this.maxBreadth == 0 || val.length === 0;
        const deleted = val.splice(this.maxBreadth);

        // Leave some indication of what was deleted
        if (deleted?.length) {
          val.push(`${TRUNCATED}:${deleted.length}`);
        }
      } else {
        const keys = Object.keys(val);
        let count = 0;
        for (const x of keys) {
          if (++count > this.maxBreadth) {
            delete val[x];
          }
        }

        // Leave some indication of what was deleted
        if (count > this.maxBreadth) {
          val[TRUNCATED] = count - this.maxBreadth;
        }

        exitPipeline = keys.length === 0 || this.maxBreadth === 0;
      }
    }
    return { val, exitPipeline };
  }
}

/**
 * A base class for other PiiFilters. Supports checking keys and values
 */
export abstract class PiiFilter implements IFilterAction {
  /** Flag determining if object values should be checked. */
  protected get checkValues() {
    return this.checkOnly === 'values' || this.checkOnly === 'both';
  }

  /** Flag determining if object keys should be checked. */
  protected get checkKeys() {
    return this.checkOnly === 'keys' || this.checkOnly === 'both';
  }

  /**
   * Creates a new regex filter action
   * @param checkOnly - Optional directive indicating what to check, a value, an object key, or both.
   * @param replaceWith - Optional value indicating what to replace a matched value with.
   */
  constructor(
    public readonly checkOnly: CheckOnly = 'values',
    public readonly replaceWith = FILTERED
  ) {}

  /**
   * Runs the filter
   * @param val - value to filter on.
   * @returns a filtered value
   */
  public execute<T extends PiiData>(val: T) {
    let exitPipeline = false;

    if (val == null) {
      exitPipeline = true;
    } else if (typeof val === 'string') {
      val = this.replaceValues(val) as T;
      exitPipeline = val === this.replaceWith;
    } else if (typeof val === 'object') {
      exitPipeline = true;

      // Mutate object
      for (const key of Object.keys(val)) {
        if (this.filterKey(key)) {
          val[key] = this.replaceWith;
        } else if (this.filterValue(val[key])) {
          val[key] = this.replaceValues(val[key]);
        }

        // Encountering a non truncated or non filtered value means the pipeline must keep running.
        if (exitPipeline && val[key] !== this.replaceWith) {
          exitPipeline = false;
        }
      }
    }

    return { val, exitPipeline };
  }

  /**
   * Indicates if value should be filtered
   * @param val
   * @returns
   */
  protected filterValue(val: any) {
    return this.checkValues && typeof val === 'string';
  }

  /**
   * Let the sub classes determine how to replace values.
   * @param val
   */
  protected abstract replaceValues(val: string): string;

  /**
   * Let subclasses determine when an object's key should be filtered out.
   * @param key
   */
  protected abstract filterKey(key: string): boolean;
}

/**
 * Uses a regular expression to scrub PII
 */
export class PiiRegexFilter extends PiiFilter implements IFilterAction {
  /**
   * Creates a new regex filter action
   * @param regex - regular expression to use for filter
   * @param checkOnly - Optional directive indicating what to check, a value, an object key, or both.
   * @param replaceWith - Optional value indicating what to replace a matched value with.
   */
  constructor(
    public readonly regex: RegExp,
    public override readonly checkOnly: CheckOnly = 'values',
    public override readonly replaceWith = FILTERED
  ) {
    super(checkOnly, replaceWith);
  }

  protected override replaceValues(val: string): string {
    return val.replace(this.regex, this.replaceWith);
  }

  protected override filterKey(key: string): boolean {
    const result = this.checkKeys && this.regex.test(key);

    // Tricky edge case. The regex maybe sticky. If so, we need to reset its lastIndex so it does not
    // affect a subsequent operation.
    if (this.regex.sticky) {
      this.regex.lastIndex = 0;
    }
    return result;
  }
}

/**
 * Makes sure that if value is a URL it doesn't have identifying info like the username or password portion of the url.
 */
export class UrlUsernamePasswordFilter extends PiiFilter {
  constructor(replaceWith = FILTERED) {
    super('values', replaceWith);
  }

  protected override replaceValues(val: string) {
    const url = tryParseUrl(val);
    if (url) {
      if (url.username) {
        url.username = this.replaceWith;
      }
      if (url.password) {
        url.password = this.replaceWith;
      }
      val = decodeURI(url.toString());
    }
    return val;
  }

  protected override filterKey(): boolean {
    return false;
  }
}

/**
 * Strips emails from data.
 */
export class EmailFilter extends PiiRegexFilter {
  private readonly encode = [`'`, `"`, `=`];
  private readonly decode = [`[[[']]]`, `[[["]]]`, `[[[=]]]`];

  constructor(checkOnly: CheckOnly = 'values', replaceWith = FILTERED) {
    super(
      // RFC 5322 generalized email regex, ~ 99.99% accurate.
      /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gim,
      checkOnly,
      replaceWith
    );
  }

  protected override replaceValues(val: string) {
    const url = tryParseUrl(val);
    if (url) {
      if (url.searchParams) {
        for (const [key, value] of url.searchParams) {
          url.searchParams.set(
            key,
            value.replace(this.regex, this.replaceWith)
          );
        }
      }
      if (url.pathname) {
        url.pathname = url.pathname
          .substring(0, 1000)
          .replace(this.regex, this.replaceWith);
      }
      try {
        val = decodeURI(url.toString());
      } catch {
        // Fallback incase the replaces made the url invalid
        val = url.toString();
      }
    }

    // Encode/decode to work around weird cases like email='foo@bar.com' which is
    // technically a valid email, but ill advised and unlikely. Even if a user had
    // this odd example email, the majority of the email would stripped, for example,
    // email='[Filtered]' thereby eliminating PII.
    this.encode.forEach((x, i) => {
      val = val.replace(x, this.decode[i]);
    });
    val = val.substring(0, 1000).replace(this.regex, this.replaceWith);
    this.decode.forEach((x, i) => {
      val = val.replace(x, this.encode[i]);
    });
    return val;
  }

  protected override filterKey(key: string): boolean {
    return false;
  }
}

/** Auxillary method for safely parsing a url. If it can't be parsed returns null. */
function tryParseUrl(val: string) {
  try {
    return new URL(val);
  } catch (_) {
    return null;
  }
}

/**
 * Some common PII scrubbing actions
 */
export const CommonPiiActions = {
  /**
   * Limits object/arrays no more than 50 values.
   */
  breadthFilter: new BreadthFilter(50),

  /**
   * Limits objects to 5 levels of depth
   */
  depthFilter: new DepthFilter(5),

  /**
   * Makes sure the user name / password is stripped out of the url.
   */
  urlUsernamePassword: new UrlUsernamePasswordFilter(),

  /**
   * Makes sure emails are stripped from data. Uses RFC 5322 generalized email regex, ~ 99.99% accurate.
   */
  emailValues: new EmailFilter(),

  /**
   * Matches IP V6 values
   */
  ipV6Values: new PiiRegexFilter(
    /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gim
  ),

  /**
   * Matches IPV4 values
   */
  ipV4Values: new PiiRegexFilter(
    /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/gim
  ),

  /**
   * Looks for keys that commonly contain PII
   */
  piiKeys: new PiiRegexFilter(
    /^oidc-.*|^remote-groups$|^uid$|^email_?|^ip_?|^user$|^user_?(id|name)$/i,
    'keys'
  ),

  /**
   * Matches uid, session, oauth and other common tokens which we would prefer not to include in Sentry reports.
   */
  tokenValues: new PiiRegexFilter(/[a-fA-F0-9]{32,}|[a-fA-F0-9]{64,}/gim),
};
