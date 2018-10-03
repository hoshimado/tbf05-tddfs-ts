/**
 * [listup_csv_test.js]
 *   encoding=UTF8
 */
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;

var target = require("../src/listup_csv.js");

describe("TEST for listup_csv_csv.js", function(){
    describe("::listupSubDirectryPath() - actual with [data/in-stub]",function () {
        var listupSubDirectoryPath = target.listupSubDirectoryPath;

        it("Csvファイルが格納されたディレクトリ（1つ下のサブを含む）から、Csvファイルのパスを全て取得する",function () {
            var TARGET_DIR = "./data/in-stub"; 

            return shouldFulfilled(
                listupSubDirectoryPath( TARGET_DIR )
            ).then(function (result) {
                console.log(result);
            });
        });
    });
});
