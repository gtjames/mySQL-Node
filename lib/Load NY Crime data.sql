DROP DATABASE   IF     EXISTS examples;
CREATE DATABASE IF NOT EXISTS examples;

USE examples;

CREATE TABLE crimes (
  CrimeId INT NOT NULL AUTO_INCREMENT,
  ComplaintNum int NOT NULL,
  FromDate varchar(30) DEFAULT NULL,
  FromTime time DEFAULT NULL,
  ToDate varchar(30) DEFAULT NULL,
  ToTime time DEFAULT NULL,
  ReportDate varchar(30) DEFAULT NULL,
  KeyCode int DEFAULT NULL,
  OffenseDesc varchar(45) DEFAULT NULL,
  PDCode int DEFAULT NULL,
  Description varchar(80) DEFAULT NULL,
  CRM_ATPT_CPTD_CD varchar(45) DEFAULT NULL,
  LawCatCode varchar(45) DEFAULT NULL,
  Jurisdiction varchar(45) DEFAULT NULL,
  Borough varchar(45) DEFAULT NULL,
  ADDR_PCT_CD int DEFAULT NULL,
  LocationOfOccurance varchar(45) DEFAULT NULL,
  PremiseType varchar(45) DEFAULT NULL,
  ParksName varchar(80) DEFAULT NULL,
  HADEVELOPT varchar(45) DEFAULT NULL,
  XCoord int DEFAULT NULL,
  YCoord int DEFAULT NULL,
  Latitude decimal(14,9) DEFAULT NULL,
  Longitude decimal(14,9) DEFAULT NULL,
  Lat_Lon varchar(60) DEFAULT NULL,
  PRIMARY KEY (CrimeId)
) ENGINE=InnoDB DEFAULT;

--
-- 
<<<<<<< HEAD
LOAD DATA LOCAL INFILE '/Users/garyjames/Documents/MyProjects/Node-MySQL/lib/100K.CSV'
=======
LOAD DATA INFILE '/Users/garyjames/Library/Mobile Documents/com~apple~CloudDocs/WebstormProjects/csv/100K.CSV'
>>>>>>> 78930f907c3477a2e2c6431b1c859ccbc0832ef0
INTO TABLE crimes
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 lines
(ComplaintNum, @FromDate, FromTime, @ToDate, ToTime, @ReportDate, KeyCode, OffenseDesc, PDCode, Description, CRM_ATPT_CPTD_CD, LawCatCode, Jurisdiction, Borough, ADDR_PCT_CD, LocationOfOccurance, PremiseType, ParksName, HADEVELOPT, XCoord, YCoord, Latitude, Longitude, Lat_Lon)
set ReportDate = STR_TO_DATE(IFNULL(@ReportDate,""), '%m/%d/%Y'),
    FromDate   = STR_TO_DATE(IFNULL(@FromDate,""),   '%m/%d/%Y'),
    ToDate     = STR_TO_DATE(IFNULL(@ToDate,""),     '%m/%d/%Y');


-- let's get all of the data loaded then add the indexes
ALTER TABLE `examples`.`crimes`
ADD INDEX `idx_Borough` (`Borough` ASC),
ADD INDEX `idx_ReportDate` (`ReportDate` ASC);

