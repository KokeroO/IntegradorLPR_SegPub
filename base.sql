SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `base_lpr`
--
DROP DATABASE IF EXISTS `base_lpr`;
CREATE DATABASE IF NOT EXISTS `base_lpr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `base_lpr`;
-- --------------------------------------------------------

--
-- Estrutura da tabela `config_system`
--

CREATE TABLE `config_system` (
  `config_systemid` int(11) UNSIGNED NOT NULL,
  `description` char(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `token` char(32) DEFAULT NULL,
  `status` tinyint(1) UNSIGNED DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Inserindo base dados da tabela `config_system`
--

INSERT INTO `config_system` VALUES
(1, 'LPRs do Município', '8sFga6N3NSJPu7xRmk38ACmn', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `config_lpr_intelbras`
--

CREATE TABLE `config_lpr_intelbras` (
  `config_lpr_intelbrasid` int(11) UNSIGNED NOT NULL,
  `config_lprid` int(11) UNSIGNED NOT NULL,
  `description` char(255) DEFAULT NULL,
  `identifier` char(30) DEFAULT NULL,
  `protocol_communication` enum('http','https') DEFAULT NULL,
  `host` char(15) DEFAULT NULL,
  `port` int(5) UNSIGNED DEFAULT NULL,
  `user` char(25) DEFAULT NULL,
  `password` char(32) DEFAULT NULL,
  `latitude` double(9,6) DEFAULT NULL,
  `longitude` double(9,6) DEFAULT NULL,
  `direction` varchar(500) DEFAULT NULL,
  `models_lpr_intelbrasid` int(11) UNSIGNED DEFAULT NULL,
  `time_pulse` tinyint(2) UNSIGNED DEFAULT NULL,
  `event_code` char(20) DEFAULT 'TrafficJunction',
  `http_code` char(3) DEFAULT NULL,
  `last_connection` int(11) DEFAULT NULL,
  `status` tinyint(1) UNSIGNED DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `config_lpr_intelbras`
--

INSERT INTO `config_lpr_intelbras` VALUES
(1, 1, 'SAIDA SEDE ', '4112959_01', 'http', '192.168.40.10', 8080, 'admin', 'admin', -25.000000, -50.000000, '{\"1\":\"OESTE A LESTE\", \"2\":\"OESTE A LESTE\"}', 2, 5, 'TrafficJunction', '200', 1660409997, 0),

-- --------------------------------------------------------

--
-- Estrutura da tabela `config_integration_entity`
--

CREATE TABLE `config_integration_entity` (
  `config_integration_entityid` int(11) NOT NULL,
  `name_integration_entity` char(30) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `script` enum('SESP_PR_CELEPAR','PRF_SPIA_AB_3.0') DEFAULT NULL,
  `identity` char(80) DEFAULT NULL,
  `url` char(120) NOT NULL,
  `token` char(64) DEFAULT NULL,
  `date_created` int(11) DEFAULT NULL,
  `date_update` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `config_integration_entity`
--

INSERT INTO `config_integration_entity` (`config_integration_entityid`, `name_integration_entity`, `status`, `script`, `identity`, `url`, `token`, `date_created`, `date_update`) VALUES
(1, 'SESP-Pr/Celepar', 1, 'SESP_PR_CELEPAR', NULL, '[URL_INTEGRACAO]', 'e27fb***********************', 1633097950, NULL),
(2, 'PRF SPIA-AB 3.0', 1, 'PRF_SPIA_AB_3.0', '[MUNICIPIO-UF]', '[URL_INTEGRACAO]', '2F5C28*******************', 1633097950, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `models_lpr_intelbras`
--

CREATE TABLE `models_lpr_intelbras` (
  `models_lpr_intelbrasid` int(11) UNSIGNED NOT NULL,
  `name_model` char(80) DEFAULT NULL,
  `url_snap` char(255) DEFAULT NULL,
  `delimiter` char(255) DEFAULT NULL,
  `delimiter_tam` smallint(5) UNSIGNED DEFAULT NULL,
  `text_header` char(255) DEFAULT NULL,
  `image_header` char(255) DEFAULT NULL,
  `active` tinyint(1) UNSIGNED DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Extraindo dados da tabela `models_lpr_intelbras`
--

INSERT INTO `models_lpr_intelbras` VALUES
(1, 'VIP 7325 LPR version: >= Aug 21 2019', 'cgi-bin/snapManager.cgi?action=attachFileProc&Flags[0]=Event', '--myboundary', 12, '\\r\\nContent-Type: text/plain\\r\\nContent-Length: [content]\\r\\n\\r\\n', '\\r\\nContent-Type: image/jpeg\\r\\nContent-Length: [content]\\r\\n\\r\\n', 1),
(2, 'VIP 93200 LPR IA FT version: >= Feb 26 2021', 'cgi-bin/snapManager.cgi?action=attachFileProc&Flags[0]=Event', '--myboundary', 12, '\\r\\nContent-Type: text/plain\\r\\nContent-Length: [content]\\r\\n\\r\\n', 'rnContent-Type: image/jpegrnContent-Length: [content]rnrn', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `traffic_integration_entity`
--

CREATE TABLE `traffic_integration_entity` (
  `traffic_integration_entityid` int(11) UNSIGNED NOT NULL,
  `traffic_junctionid` int(11) UNSIGNED NOT NULL,
  `script` char(20) DEFAULT NULL,
  `date_created` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `traffic_integration_entity_logs`
--

CREATE TABLE `traffic_integration_entity_logs` (
  `traffic_integration_entity_logsid` int(11) UNSIGNED NOT NULL,
  `traffic_junctionid` int(11) DEFAULT NULL,
  `message` varchar(500) DEFAULT NULL,
  `script` char(20) DEFAULT NULL,
  `date_created` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `traffic_junction`
--

CREATE TABLE `traffic_junction` (
  `traffic_junctionid` int(11) UNSIGNED NOT NULL,
  `config_lpr_intelbrasid` int(11) UNSIGNED DEFAULT NULL,
  `vehiclesid` int(11) UNSIGNED DEFAULT NULL,
  `runway` tinyint(1) UNSIGNED DEFAULT NULL,
  `speed` smallint(3) DEFAULT NULL,
  `image` char(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `utc` int(11) UNSIGNED DEFAULT NULL,
  `date_created` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `vehicles`
--

CREATE TABLE `vehicles` (
  `vehiclesid` int(11) UNSIGNED NOT NULL,
  `plate` varchar(7) CHARACTER SET utf8mb4 DEFAULT NULL,
  `category` enum('Motorcycle','Normal','','') CHARACTER SET utf8mb4 DEFAULT 'Normal',
  `description` char(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `color` char(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `image` char(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `integrate_entity` tinyint(1) DEFAULT 1,
  `date_created` int(11) DEFAULT NULL,
  `date_update` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `vehicle_occurrences`
--

CREATE TABLE `vehicles_occurrences` (
  `vehicles_occurrencesid` int(11) UNSIGNED NOT NULL,
  `traffic_junctionid` int(11) UNSIGNED NOT NULL,
  `cod_occurrence` tinyint(3) UNSIGNED NOT NULL,
  `response` varchar(500) DEFAULT NULL,
  `date_registry` char(24) DEFAULT NULL,
  `date_created` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `config_system`
--
ALTER TABLE `config_system`
  ADD PRIMARY KEY (`config_systemid`);

--
-- Índices para tabela `config_lpr_intelbras`
--
ALTER TABLE `config_lpr_intelbras`
  ADD PRIMARY KEY (`config_lpr_intelbrasid`);

--
-- Índices para tabela `config_integration_entity`
--
ALTER TABLE `config_integration_entity`
  ADD PRIMARY KEY (`config_integration_entityid`);

--
-- Índices para tabela `models_lpr_intelbras`
--
ALTER TABLE `models_lpr_intelbras`
  ADD PRIMARY KEY (`models_lpr_intelbrasid`);

--
-- Índices para tabela `traffic_integration_entity`
--
ALTER TABLE `traffic_integration_entity`
  ADD PRIMARY KEY (`traffic_integration_entityid`);

--
-- Índices para tabela `traffic_integration_entity_logs`
--
ALTER TABLE `traffic_integration_entity_logs`
  ADD PRIMARY KEY (`traffic_integration_entity_logsid`);

--
-- Índices para tabela `traffic_junction`
--
ALTER TABLE `traffic_junction`
  ADD PRIMARY KEY (`traffic_junctionid`);

--
-- Índices para tabela `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehiclesid`);

--
-- Índices para tabela `vehicles_occurrences`
--
ALTER TABLE `vehicles_occurrences`
  ADD PRIMARY KEY (`vehicles_occurrencesid`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `config_lpr`
--
ALTER TABLE `config_system`
  MODIFY `config_systemid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `config_lpr_intelbras`
--
ALTER TABLE `config_lpr_intelbras`
  MODIFY `config_lpr_intelbrasid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `config_integration_entity`
--
ALTER TABLE `config_integration_entity`
  MODIFY `config_integration_entityid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `models_lpr_intelbras`
--
ALTER TABLE `models_lpr_intelbras`
  MODIFY `models_lpr_intelbrasid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `traffic_integration_entity`
--
ALTER TABLE `traffic_integration_entity`
  MODIFY `traffic_integration_entityid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68581;

--
-- AUTO_INCREMENT de tabela `traffic_integration_entity_logs`
--
ALTER TABLE `traffic_integration_entity_logs`
  MODIFY `traffic_integration_entity_logsid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3730;

--
-- AUTO_INCREMENT de tabela `traffic_junction`
--
ALTER TABLE `traffic_junction`
  MODIFY `traffic_junctionid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34349;

--
-- AUTO_INCREMENT de tabela `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehiclesid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9460;

--
-- AUTO_INCREMENT de tabela `vehicles_occurrences`
--
ALTER TABLE `vehicles_occurrences`
  MODIFY `vehicles_occurrencesid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
