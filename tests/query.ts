const url = "YOUR_RPC_CONNECTION_HERE";

const getAssetsByAuthority = async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByAuthority',
        params: {
          authorityAddress: '4kMA1QFKGmLoNgSKXd7D17FXWB6uEjmRFwQACkmBeJRB',
          page: 1, // Starts at 1
          limit: 1000
        },
      }),
    });
    
    const { result } = await response.json();

    // filter the result.items to where .mint_extensions.metadata.symbol === 'COD'
    const raw_collection = result.items.filter((item: any) => item.mint_extensions.metadata.symbol === 'RAW' && item.burnt === false && !item.mint_extensions.metadata.name.includes('Placeholder')
  );
    const cod_collection = result.items.filter((item: any) => item.mint_extensions.metadata.symbol === 'COD');
    const cyc_collection = result.items.filter((item: any) => item.mint_extensions.metadata.symbol === 'CYC');
    // console.log('RAW COLLECTION', raw_collection[0]);
    const raw_hashlist: any = [];
    const cod_hashlist: any = [];
    const cyc_hashlist: any = [];

    // get the id from each item in the raw_collection
    for (let i = 0; i < cyc_collection.length; i++) {
        // console.log('RAW COLLECTION ID', raw_collection[i].id);
        cyc_hashlist.push(cyc_collection[i].id);
    }


    // save the raw_hashlist to a file in json format
    const fs = require('fs');

    // save the hashlist in an excel file
    const excel = require('exceljs');
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('CYC Hashlist');
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
    ];

    for (let i = 0; i < cyc_hashlist.length; i++) {
        worksheet.addRow({ id: cyc_hashlist[i] });
    }

    workbook.xlsx.writeFile('cyc_hashlist.xlsx').then(() => {
        console.log('File saved!');
    });
    
};
getAssetsByAuthority(); 