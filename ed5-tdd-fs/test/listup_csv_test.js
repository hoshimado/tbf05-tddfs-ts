/**
 * [listup_csv_test.js]
 *   encoding=UTF8
 */
var assert = require("chai").assert;
var expect = require("chai").expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var hookProperty = require("hook-test-helper").hookProperty; // for test code.


var target = require("../src/listup_csv.js");

describe("TEST for listup_csv_csv.js", function(){
    describe("::listupSubDirectryPath()",function () {
        var listupSubDirectoryPath = target.listupSubDirectoryPath;

        var stubbedManager = {};
        var stubs;
        beforeEach(()=>{
            stubs = {
                "fs" : {
                    "readdir" : sinon.stub(), // https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
                    "stat" : sinon.stub()     // https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback
                }
            };
            stubbedManager["hook"] = hookProperty(target.hook, stubs);
        });
        afterEach(()=>{
            stubbedManager.hook.restore();
        });

        var setupFsStubs = function(targetStubs){
            targetStubs.fs.readdir.withArgs("./data/in-stub")
            .callsArgWith(2, /* err= */ null, /* files= */ ["sub1","sub2","moreDeep"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/sub1")
            .callsArgWith(2, /* err= */ null, /* files= */ ["v2017.01.csv","v2017.02.csv","v2017.03.csv"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.01.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.02.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.03.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/sub2")
            .callsArgWith(2, /* err= */ null, /* files= */ ["v2018.01.csv","v2018.02.csv"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2/v2018.01.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2/v2018.02.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/moreDeep")
            .callsArgWith(2, /* err= */ null, /* files= */ ["hoge.txt","piyo"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/hoge.txt")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/piyo")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/moreDeep/piyo")
            .callsArgWith(2, /* err= */ null, /* files= */ ["limit.txt"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/piyo/limit.txt")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
        };

        it("csvファイルが格納されたディレクトリ（1つ下のサブを含む）から、csvファイルのパスを全て取得する",function () {
            var TARGET_DIR = "./data/in-stub"; 
            var EXPECTED_LIST = [
                './data/in-stub/sub2/v2018.01.csv',
                './data/in-stub/sub2/v2018.02.csv',
                './data/in-stub/sub1/v2017.01.csv',
                './data/in-stub/sub1/v2017.02.csv',
                './data/in-stub/sub1/v2017.03.csv',
                './data/in-stub/moreDeep/hoge.txt',
                './data/in-stub/moreDeep/piyo/' // 個の下は2階層下なので「limit.txt」は拾わないこと。
            ];
            setupFsStubs(stubs);

            return shouldFulfilled(
                listupSubDirectoryPath( TARGET_DIR )
            ).then(function (result) {
                assert( result );

                result.sort(function(a,b){
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                    return 0;
                });
                EXPECTED_LIST.sort(function(a,b){
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                    return 0;
                });
                expect( result ).to.deep.equal( EXPECTED_LIST );
            });
        });
    });
});
