CREATE DATABASE estoque_epis;

USE estoque_epis;

CREATE TABLE epis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    categoria VARCHAR(50) NOT NULL
);


CREATE TABLE retiradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ldap VARCHAR(50) NOT NULL,
    nome_epi VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    tamanho VARCHAR(10),
    data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);