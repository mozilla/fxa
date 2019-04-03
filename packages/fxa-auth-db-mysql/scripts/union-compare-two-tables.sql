-- In comparing two tables, where one of the tables has additional columns
-- that do not exist in the other table, we only compare the columns that
-- exist in both tables.

SELECT
  HEX(uid) AS uid,
  normalizedEmail,
  email,
  HEX(emailCode) AS emailCode,
  emailVerified,
  HEX(kA) AS kA,
  HEX(wrapWrapKb) AS wrapWrapKb,
  HEX(authSalt) AS authSalt,
  HEX(verifyHash) AS verifyHash,
  verifierVersion,
  FROM_UNIXTIME(verifierSetAt/1000) AS verifierSetAt,
  FROM_UNIXTIME(createdAt/1000) AS createdAt,
  LEFT(locale, 16) AS locale,
  FROM_UNIXTIME(lockedAt/1000) AS lockedAt
FROM (
  SELECT
    uid,
    normalizedEmail,
    email,
    emailCode,
    emailVerified,
    kA,
    wrapWrapKb,
    authSalt,
    verifyHash,
    verifierVersion,
    verifierSetAt,
    createdAt,
    locale,
    lockedAt
  FROM accounts

  UNION ALL

  SELECT
    uid,
    normalizedEmail,
    email,
    emailCode,
    emailVerified,
    kA,
    wrapWrapKb,
    authSalt,
    verifyHash,
    verifierVersion,
    verifierSetAt,
    createdAt,
    locale,
    lockedAt                    
  FROM _accounts_new
) AS t
GROUP BY
  t.uid,                        
  t.normalizedEmail,            
  t.email,                      
  t.emailCode,                  
  t.emailVerified,              
  t.kA,                         
  t.wrapWrapKb,                 
  t.authSalt,                   
  t.verifyHash,                 
  t.verifierVersion,            
  t.verifierSetAt,              
  t.createdAt,                  
  t.locale,                     
  t.lockedAt  

-- Two rows with all fields identical are grouped together into 1 row with a
-- count of 2.  If there is a mismatches between the two tables, two separate
-- rows with a count of 1 wil be output by this query.
HAVING COUNT(*) = 1 
ORDER BY t.uid
LIMIT 100
