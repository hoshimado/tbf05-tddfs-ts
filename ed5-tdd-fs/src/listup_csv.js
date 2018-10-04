/**
 * [listup_csv.js]
 *   encoding=UTF8
 */

var createHookPoint = require("hook-test-helper").createHookPoint;
var hook = createHookPoint( exports, "hook" );
var csvSync = require("csv-parse/lib/sync");

hook["fs"] = require("fs");


exports.diffCsvInDir = function ( targetDir ) {
    var promise = hook.listupSubDirectoryPath( targetDir );
    return promise.then(function (list) {
        var sorted = list.sort(function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
        });
        var n = sorted.length;
        var filesTextPromise = []
        while(0<n--){
            filesTextPromise.push( readFilePromise(sorted[n]) );
        }
        return Promise.all(filesTextPromise);
    }).then(function (list) {
        var i, n = list.length;
        var itemBefore, itemAfter
        var resultsArray = []
        for( i=1; i<n; i++ ){
            itemAfter = csvSync( list[i-1] );
            itemBefore = csvSync( list[i] );
            resultsArray.push( hook.diffMapFrom2Csv( itemAfter, itemBefore ) );
        }
        return Promise.resolve( resultsArray );
    });    
};

var readFilePromise = function (targetPath) {
    return new Promise(function (resolve,reject) {
        hook.fs.readFile( targetPath, "utf8", function (err, data) {
           if( err ){
               reject(err);
           }else{
               resolve(data);
           }
        });
    })
};


hook["diffMapFrom2Csv"] = function (csvArray2, csvArray1) {
    var i, n, item;
    var listDiffMap2 = [], map1 = {};

    n = csvArray1.length;
    while(0<n--){
        item = csvArray1[n];
        map1[ item[0] ] = item[1];
    }
    n = csvArray2.length;
    while(0<n--){
        item = csvArray2[n];
        if( map1[ item[0] ] != item[1] ){
            listDiffMap2.push({
                "name"   : item[0],
                "before" : map1[ item[0] ],
                "after"  : item[1]
            });
        }
    }

    listDiffMap2 = listDiffMap2.sort(function(a,b){
        if( a.name < b.name ) return -1;
        if( a.name > b.name ) return 1;
        return 0;
    });
    return listDiffMap2;
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
