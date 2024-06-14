export type SolFactory = {
  "version": "0.1.0",
  "name": "sol_factory",
  "instructions": [
    {
      "name": "intializeProtocolAccount",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "lockProtocol",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAdminAccount",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminState",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "newAdmin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newAdminState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "createCollection",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "saleStartTime",
          "type": "i64"
        },
        {
          "name": "maxSupply",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "stableId",
          "type": "string"
        },
        {
          "name": "reference",
          "type": "string"
        },
        {
          "name": "whitelist",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "whitelistStartTime",
          "type": "i64"
        },
        {
          "name": "whitelistPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createNft",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token2022Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "attributes",
          "type": {
            "vec": {
              "defined": "Attributes"
            }
          }
        }
      ]
    },
    {
      "name": "transferNft",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerMintAta",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token2022Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPlaceholder",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "placeholder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token2022Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "buyPlaceholder",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "collection",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerMintAta",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "placeholder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token2022Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnPlaceholder",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerMintAta",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "placeholder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "placeholderMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token2022Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Protocol",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "locked",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "publickey",
            "type": "publicKey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "initialized",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Collection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "saleStartTime",
            "type": "i64"
          },
          {
            "name": "maxSupply",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "stableId",
            "type": "string"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "whitelist",
            "type": {
              "defined": "WhiteList"
            }
          },
          {
            "name": "whitelistStartTime",
            "type": "i64"
          },
          {
            "name": "whitelistPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Placeholder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "CompletedPlaceholder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "AiNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          },
          {
            "name": "inscription",
            "type": "string"
          },
          {
            "name": "rank",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "CompletedAiNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "collection",
            "type": "publicKey"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "inscription",
            "type": "string"
          },
          {
            "name": "rank",
            "type": "u16"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WhiteList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallets",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "Attributes",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "BuyingError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NotTimeYet"
          },
          {
            "name": "SoldOut"
          },
          {
            "name": "NotInWhitelist"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action"
    }
  ],
  "metadata": {
    "address": "EwaK6Cyb8phWXgEPn3xrbZLokSe1PSsDVkcCwQgs6yws"
  }
}