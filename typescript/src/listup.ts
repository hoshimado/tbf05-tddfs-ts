/**
 * [listup.ts]
 *   encoding=UTF8
 */

import * as fs from "fs";

// TypeScriptでは、export/importはトップレベル以外許可されない。
// つまり「if(){}で、環境変数に応じて分岐させる技は通じない。。。
export const hook = {
    "fs" : fs
};

export const listupSubDirectoryPath = ( targetDir: string ) => {
    let filelsit: string[] = ["hello world.txt"];

    return Promise.resolve( filelsit );
};



