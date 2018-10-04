/**
 * [listup_csv.js]
 *   encoding=UTF8
 */

var createHookPoint = require("hook-test-helper").createHookPoint;
var hook = createHookPoint( exports, "hook" );
var csvSync = require("csv-parse/lib/sync");

hook["fs"] = require("fs");


exports.diffCsvInDir = function ( targetDir ) {
    return Promise.resolve([]);    
};

hook["diffMapFrom2Csv"] = function (csvArray2, csvArray1) {
    return [];
};



var promiseStat = function ( targetDir, name ) {
    var targetPath = targetDir + "/" + name;

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

var promiseReadDir = function ( targetDir ) {
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
    });
};

var promiseReadDirRecursive = function (targetDir, directory2live) {
    return promiseReadDir( targetDir ).then(function (results) {
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

hook["listupSubDirectoryPath"] = function ( targetDir ) {
    // 深さを「２」とする。
    return promiseReadDirRecursive( targetDir, 2 ).then(function (list) {
        return Promise.resolve(list);
    });
};
