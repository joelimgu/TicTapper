

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ref` varchar(255) NOT NULL,
  `pre_url` varchar(255) DEFAULT NULL,
  `uid_len` int(4) DEFAULT 0,
  `qty` int(11) DEFAULT NULL,
  `qtydone` int(11) DEFAULT NULL,
  `rom` int(4) NOT NULL DEFAULT '0',
  `status` varchar(25) DEFAULT NULL,
  `modified_at` double NOT NULL,
  `created_at` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `uid` varchar(255) DEFAULT NULL,
  `timespent` double DEFAULT 0,
  `timeToDetect` double DEFAULT 0,
  `timeToIdentify` double DEFAULT 0,
  `timeToRead` double DEFAULT 0,
  `timeToWrite` double DEFAULT 0,
  `datum` text,
  `stamp` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

