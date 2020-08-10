
const DEFAULT_JOBS_TABLE = "CREATE TABLE IF NOT EXISTS \`jobs\` ("+
  "\`id\` int NOT NULL AUTO_INCREMENT,"+
  "\`name\` varchar(255) NOT NULL,"+
  "\`ref\` varchar(255) NOT NULL,"+
  "\`pre_url\` varchar(255) DEFAULT NULL,"+
  "\`uid_len\` int DEFAULT 0,"+
  "\`qty\` int DEFAULT NULL,"+
  "\`qtydone\` int DEFAULT NULL,"+
  "\`rom\` int NOT NULL DEFAULT '0',"+
  "\`status\` varchar(25) DEFAULT NULL,"+
  "\`modified_at\` double NOT NULL,"+
  "\`created_at\` double DEFAULT NULL," +
  "PRIMARY KEY (\`id\`)"+
") ENGINE=MyISAM DEFAULT CHARSET=UTF8MB3 AUTO_INCREMENT=1;"

const DEFAULT_TAGS_TABLE =
"CREATE TABLE IF NOT EXISTS \`tags\` ("+
  "\`id\` int NOT NULL AUTO_INCREMENT,"+
  "\`job_id\` int NOT NULL,"+
  "\`url\` varchar(255) DEFAULT NULL,"+
  "\`uid\` varchar(255) DEFAULT NULL,"+
  "\`timespent\` double DEFAULT 0,"+
  "\`timeToDetect\` double DEFAULT 0,"+
  "\`timeToIdentify\` double DEFAULT 0,"+
  "\`timeToRead\` double DEFAULT 0,"+
  "\`timeToWrite\` double DEFAULT 0,"+
  "\`datum\` text,"+
  "\`stamp\` int DEFAULT NULL,"+
  "PRIMARY KEY (\`id\`)"+
") ENGINE=MyISAM  DEFAULT CHARSET=UTF8MB3 AUTO_INCREMENT=1 ;";


module.exports = {DEFAULT_JOBS_TABLE, DEFAULT_TAGS_TABLE};
