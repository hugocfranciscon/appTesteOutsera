## Descrição

Este projeto é uma API desenvolvida em Node.js utilizando Express para processar um arquivo CSV de filmes e fornecer informações sobre os prêmios dos produtores.

#### # Requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- Node.js (versão 14 ou superior)

#### # Instalação

Clone o repositório:

    git clone https://github.com/hugocfranciscon/appTesteOutsera.git

    cd seu-repositorio

Instale as dependências do projeto:

    npm install

#### # Execução

Certifique-se de que o arquivo **Movielist.csv** está presente no diretório do projeto.

Inicie o servidor:

    node index.js

A API estará disponível em:

    http://localhost:3000

#### # Endpoints

    GET /awards/intervals

Retorna os produtores com os menores e maiores intervalos entre os prêmios.

Exemplo de resposta:

```json
{
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2008,
      "followingWin": 2009
    },
    {
      "producer": "Producer 2",
      "interval": 1,
      "previousWin": 2018,
      "followingWin": 2019
    }
  ],
  "max": [
    {
      "producer": "Producer 1",
      "interval": 99,
      "previousWin": 1900,
      "followingWin": 1999
    },
    {
      "producer": "Producer 2",
      "interval": 99,
      "previousWin": 2000,
      "followingWin": 2099
    }
  ]
}
```

#### # Testes de Integração
Para rodar os testes de integração:

    npm test

Isso executará os testes utilizando a estrutura definida no projeto.