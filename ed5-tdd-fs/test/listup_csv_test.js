/**
 * [listup_csv_test.js]
 *   encoding=UTF8
 */
var assert = require("chai").assert; // ★Assertion版の追加部分
var expect = require("chai").expect; // ★Assertion版の追加部分
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;

var target = require("../src/listup_csv.js");

describe("TEST for listup_csv_csv.js", function(){
    describe("::listupSubDirectryPath() - actual with [data/in-stub] - Assertion",function () {
        var listupSubDirectoryPath = target.listupSubDirectoryPath;

        it("Csvファイルが格納されたディレクトリ（1つ下のサブを含む）から、Csvファイルのパスを全て取得する",function () {
            var TARGET_DIR = "./data/in-stub"; 

            return shouldFulfilled(
                listupSubDirectoryPath( TARGET_DIR )
            ).then(function (result) {
                // ★Assertion版の変更部分
                assert( Array.isArray(result), "戻り値は配列" );
                expect( result ).to.deep.equal([ 
                    './data/in-stub/sub2/v2018.01.csv',
                    './data/in-stub/sub2/v2018.02.csv',
                    './data/in-stub/sub1/v2017.01.csv',
                    './data/in-stub/sub1/v2017.02.csv',
                    './data/in-stub/sub1/v2017.03.csv',
                    './data/in-stub/moreDeep/hoge.txt',
                    './data/in-stub/moreDeep/piyo/' 
                ]);
            });
        });
    });
});
