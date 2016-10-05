/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE TABLE IF NOT EXISTS `part` (
  `nParId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `nTraId` int(11) unsigned NOT NULL,
  `dCreate` int(35) unsigned NOT NULL,
  `dUpdate` int(35) unsigned NOT NULL,
  `nOffset` int(8) unsigned NOT NULL,
  `nParty` int(4) unsigned NOT NULL DEFAULT '1',
  `sTranscript` mediumtext NOT NULL,
  PRIMARY KEY (`nParId`),
  KEY `part-transcript` (`nTraId`),
  CONSTRAINT `part-transcript` FOREIGN KEY (`nTraId`) REFERENCES `transcript` (`nTraId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `transcript` (
  `nTraId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dCreate` int(35) unsigned NOT NULL,
  `dUpdate` int(35) unsigned NOT NULL,
  `nPartyCount` int(4) unsigned NOT NULL,
  `nSpeed` decimal(5,2) NOT NULL DEFAULT '1.00',
  `nVolume` decimal(5,2) NOT NULL DEFAULT '1.00',
  `nCurrentParty` int(4) NOT NULL DEFAULT '1',
  `nCurrentOffset` int(4) NOT NULL DEFAULT '0',
  `sName` varchar(100) NOT NULL,
  `sAudio` varchar(255) NOT NULL,
  PRIMARY KEY (`nTraId`),
  UNIQUE KEY `sName` (`sName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
