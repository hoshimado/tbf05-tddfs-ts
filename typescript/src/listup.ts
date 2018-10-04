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


// https://qiita.com/uhyo/items/e2fdef2d3236b9bfe74a
interface StatWithName {
    "name"  : string,
    "stats" : fs.Stats
};

var promiseStat = ( targetDir:string, name:string ) => {
    const targetPath:string = targetDir + "/" + name;

    return new Promise(function (resolve,reject) {
        hook.fs.stat( targetPath, function (err, stats) {
            if(err){
                reject(err);
            }else{
                resolve({
                    "name" : name,
                    "stats" : stats
                });
            }
        })
    });
};

var promiseReadDirRecursive = (targetDir, directory2live) => {
    return new Promise(function (resolve, reject) {
        hook.fs.readdir( targetDir, "utf8", function (err, files) {
            var n, promiseDirArray = [], targetPath;
            if(err){
                reject(err);
            }else{
                n = files.length;
                while(0<n--){
                    promiseDirArray.push(
                        promiseStat( targetDir, files[n] )
                    );
                }
                Promise.all(promiseDirArray).then(function (results) {
                    resolve(results);
                });
            }
        });
    }).then(function (results:StatWithName[]) {
        var outputList = [];
        var n = results.length, targetPath;
        var promiseDirArray = [];
        directory2live--;

        while(0<n--){
            targetPath = targetDir + "/" + results[n].name;
            if( results[n].stats.isDirectory() ){

                if( directory2live > 0 ){
                    promiseDirArray.push( 
                        promiseReadDirRecursive( targetPath, directory2live ) 
                    );
                }else{
                    outputList.push( targetPath + "/" );
                }
            }else{
                outputList.push( targetPath );
            }
        }
        return Promise.all( promiseDirArray ).then(function (subLists) {
            var n = subLists.length;
            while(0<n--){
                Array.prototype.push.apply(outputList, subLists[n]);
            }
            return Promise.resolve( outputList );
        });
    });
};

export const listupSubDirectoryPath = async ( targetDir: string ) => {
/*
    let filelsit: string[] = ["hello world.txt"];

    return filelsit;
//*/
///*
    const list:string[] = await promiseReadDirRecursive( targetDir, 2 );
    return list;
//*/
};


