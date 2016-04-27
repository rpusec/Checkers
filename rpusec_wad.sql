-- phpMyAdmin SQL Dump
-- version 4.4.12
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2016 at 09:51 AM
-- Server version: 5.6.25
-- PHP Version: 5.6.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

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
  `MessageID` int(11) NOT NULL,
  `USER_UserID` int(11) NOT NULL,
  `ROOM_roomID` int(11) DEFAULT NULL,
  `message` varchar(200) NOT NULL,
  `exparation` bigint(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`MessageID`, `USER_UserID`, `ROOM_roomID`, `message`, `exparation`) VALUES
(43, 1, NULL, 'rrrrrrrrr', 1461743071);

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE IF NOT EXISTS `room` (
  `roomID` int(11) NOT NULL,
  `whoseTurn` int(11) DEFAULT NULL,
  `stringifiedBoard` varchar(150) NOT NULL,
  `lastMove` varchar(70) DEFAULT NULL,
  `removedPawns` varchar(100) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`roomID`, `whoseTurn`, `stringifiedBoard`, `lastMove`, `removedPawns`) VALUES
(1, 1, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', NULL, NULL),
(2, 2, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', NULL, NULL),
(3, 1, '0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,1,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,2,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0', NULL, NULL),
(4, 2, '1,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,2,0,0,0,0,0,0', '{"id":1,"prevX":2,"prevY":2,"newX":0,"newY":4}', '[2]'),
(5, 2, '', '', ''),
(6, 1, '1,0,2,0,3,0,4,0|0,5,0,6,0,7,0,8|9,0,10,0,11,0,12,0|0,0,0,0,0,0,0,0|0,0,0,0,0,0,0,0|0,13,0,14,0,15,0,16|17,0,18,0,19,0,20,0|0,21,0,22,0,23,0,24', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `UserID` int(11) NOT NULL,
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
  `won` int(11) NOT NULL DEFAULT '0',
  `lost` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `FName`, `LName`, `Username`, `Password`, `connected`, `connexparation`, `chatColorR`, `chatColorG`, `chatColorB`, `ROOM_roomID`, `won`, `lost`) VALUES
(1, 'Burek', 'Sasirom', 'marelica', 'test', 0, 1461743062, '230', '222', '255', NULL, 7, 7),
(2, 'roman', 'pusec', 'lawl', 'lawl', 0, 1461743038, '222', '250', '255', NULL, 9, 5),
(3, 'tino', 'herljevic', 'therljevic', '11111111', 0, 1461743041, '222', '255', '240', NULL, 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`MessageID`),
  ADD KEY `fk_MESSAGE_USER` (`USER_UserID`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`roomID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `MessageID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=44;
--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `roomID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
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
