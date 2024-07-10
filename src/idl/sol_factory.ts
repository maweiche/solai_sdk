export type SolFactory = {
  "version": "0.1.0",
  "name": "sol_factory",
  "instructions": [
    {
      "name": "initializeProtocolAccount",
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
          "name": "protocol",
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
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeAdminAccount",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "primaryAdmin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "protocol",
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
      "name": "createCollection",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
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
          "name": "adminState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "protocol",
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
          "name": "reference",
          "type": "publicKey"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "url",
          "type": "string"
        },
        {
          "name": "saleStartTime",
          "type": "i64"
        },
        {
          "name": "saleEndTime",
          "type": "i64"
        },
        {
          "name": "maxSupply",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "f32"
        },
        {
          "name": "stableId",
          "type": "string"
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
          "name": "protocol",
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
          "name": "buyerPlaceholderMintAta",
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
          "name": "placeholderMintAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "protocol",
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
          "name": "protocol",
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
          "name": "collectionOwner",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
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
          "name": "protocol",
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
      "name": "airdropPlaceholder",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": false
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
          "name": "collectionOwner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "CHECK"
          ]
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
          "name": "protocol",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
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
            "name": "reference",
            "type": "publicKey"
          },
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
            "name": "url",
            "type": "string"
          },
          {
            "name": "saleStartTime",
            "type": "i64"
          },
          {
            "name": "saleEndTime",
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
            "name": "mintCount",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "f32"
          },
          {
            "name": "stableId",
            "type": "string"
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
            "type": "f32"
          },
          {
            "name": "timeStamp",
            "type": "i64"
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
            "type": "f32"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
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
            "name": "Expired"
          },
          {
            "name": "SoldOut"
          },
          {
            "name": "NotInWhitelist"
          },
          {
            "name": "WalletDoesNotMatch"
          },
          {
            "name": "TokenAccountMismatch"
          }
        ]
      }
    },
    {
      "name": "ProtocolError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ProtocolLocked"
          },
          {
            "name": "UnauthorizedAdmin"
          },
          {
            "name": "InstructionsNotCorrect"
          },
          {
            "name": "InvalidSaleTime"
          },
          {
            "name": "InvalidMaxSupply"
          },
          {
            "name": "InvalidPrice"
          },
          {
            "name": "InvalidMintCount"
          },
          {
            "name": "InvalidBalancePreMint"
          },
          {
            "name": "InvalidBalancePostMint"
          },
          {
            "name": "TotalSupplyNotIncreased"
          },
          {
            "name": "InvalidBalancePreBurn"
          },
          {
            "name": "InvalidBalancePostBurn"
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
    "address": "DHHnPaKKDLadRHLqVHWf2YpuK5Y6guJio99pD5sh2GVD"
  }
}