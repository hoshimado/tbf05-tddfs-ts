/**
 * [listup_test.ts]
 *   encoding=UTF8
 */

import { describe, it } from "mocha";
import { expect } from "chai";

import { listupSubDirectoryPath } from '../src/listup';


describe('TEST for listup_csv_csv.js', () => {
    describe("::listupSubDirectryPath()", () => {
        it("Csvファイルが格納されたディレクトリ（1つ下のサブを含む）から、Csvファイルのパスを全て取得する", async () => {
            const TARGET_DIR:string = "./data/in-stub"; 

            const result:string[] = await listupSubDirectoryPath( TARGET_DIR )
            .catch((err)=>{throw err;});

            expect( result ).to.deep.equal( ["hello world.txt"] );
            console.log(result);
        });
    });
});

