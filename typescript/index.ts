/**
 * [lidex.ts]
 *   encoding=UTF8
 */


import {listupSubDirectoryPath} from './src/listup';

const main = async ( targetDir:string )=>{
    const diff = await listupSubDirectoryPath( targetDir );
    console.log( JSON.stringify(diff) );
};

main( process.argv[2] );

