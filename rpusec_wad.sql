-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2016 at 12:29 AM
-- Server version: 5.6.16
-- PHP Version: 5.5.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `rpusec_wad`
--
CREATE DATABASE IF NOT EXISTS `rpusec_wad` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `rpusec_wad`;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE IF NOT EXISTS `message` (
  `MessageID` int(11) NOT NULL AUTO_INCREMENT,
  `USER_UserID` int(11) NOT NULL,
  `message` varchar(200) NOT NULL,
  `exparation` bigint(100) NOT NULL,
  PRIMARY KEY (`MessageID`),
  KEY `fk_MESSAGE_USER` (`USER_UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE IF NOT EXISTS `room` (
  `roomID` int(11) NOT NULL AUTO_INCREMENT,
  `whose_turn` int(11) DEFAULT NULL,
  `stringifiedBoard` varchar(150) NOT NULL,
  `lastMove` varchar(70) NOT NULL,
  `removedPawns` varchar(100) NOT NULL,
  PRIMARY KEY (`roomID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`roomID`, `whose_turn`, `stringifiedBoard`, `lastMove`, `removedPawns`) VALUES
(1, 1, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', '', ''),
(2, 2, '15,0,2,0,3,0,4,0|0,0,0,6,0,7,0,0|1,0,0,0,0,0,8,0|0,9,0,0,0,0,0,16|13,0,0,0,0,0,19,0|0,17,0,14,0,0,0,0|0,0,18,0,0,0,20,0|0,21,0,22,0,23,0,24', '{"id":1,"prevX":4,"prevY":4,"newX":0,"newY":0}', '[10,5]'),
(3, 2, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', '', ''),
(4, 1, '', '', ''),
(5, 2, '', '', ''),
(6, 1, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `FName` varchar(50) NOT NULL,
  `LName` varchar(50) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `connected` tinyint(1) NOT NULL,
  `connexparation` bigint(20) NOT NULL,
  `chatColorR` varchar(3) NOT NULL,
  `chatColorG` varchar(3) NOT NULL,
  `chatColorB` varchar(3) NOT NULL,
  `ROOM_roomID` int(11) DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `FName`, `LName`, `Username`, `Password`, `connected`, `connexparation`, `chatColorR`, `chatColorG`, `chatColorB`, `ROOM_roomID`) VALUES
(1, 'tzutuz', 'asdfsad', 'test123', 'test', 1, 1459202055, '255', '239', '222', 0),
(2, 'roman', 'pusec', 'lawl', 'lawl', 0, 1459202028, '224', '255', '222', 0),
(3, 'tino', 'herljevic', 'therljevic', '11111111', 0, 1458820706, '255', '230', '222', 0);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `fk_MESSAGE_USER` FOREIGN KEY (`USER_UserID`) REFERENCES `user` (`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
