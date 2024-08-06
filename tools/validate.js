#!/usr/bin/env node
const path = require("path");
const {Validator} = require("../docs/static/js/validator.js");
const fs = require("fs");
const ajv2020 = require("ajv/dist/2020");

function show_help()
{
    console.log("\n\n", process.argv[1], "[Option...]", "file", "\n\nOptions:\n");

    for ( let [name, [nargs, help, _]] of Object.entries(args) )
        console.log(name, " arg".repeat(nargs), "\n\t", help);

    process.exit(0);
}

var schema_path = path.resolve(__dirname, "../docs/lottie.schema.json");
var json_file = null;
var show_warnings = false;
var format = "json";

var args = {
    "--schema": [1, "Path to the schema", (arg) => { schema_path = arg; }],
    "--help": [0, "Shows help", () => show_help()],
    "--warn": [0, "Show warnings", () => { show_warnings = true; }],
    "--format": [1, "Output format", (arg) => { format = arg; }],
}
args["-h"] = args["--help"];
args["-w"] = args["--warn"];
args["-f"] = args["--format"];



for ( let i = 2; i < process.argv.length; )
{
    let arg = process.argv[i];
    let data = args[arg];
    if ( !data )
    {
        if ( json_file === null )
        {
            json_file = arg;
            i += 1;
            continue;
        }
        console.error(`Unknown argument ${arg}`);
        process.exit(1);
    }

    let [nargs, _, func] = data;

    func(...process.argv.slice(i, i+nargs));

    i += nargs + 1;
}

if ( json_file === null )
{
    console.error(`Missing file to validate`);
    process.exit(1);
}


const data = fs.readFileSync(json_file, "utf8");
const schema = JSON.parse(fs.readFileSync(schema_path, "utf8"));
const validator = new Validator(ajv2020.Ajv2020, schema);
var errors = validator.validate(data);
if ( !show_warnings )
    errors = errors.filter(e => e.type == "error");


if ( format == "json" )
{
    console.log(JSON.stringify(errors, null, 4));
}
else
{
    for ( let err of errors )
        console.log(err.path, ":", err.type, ":", err.message);
}


if ( errors.find(e => e.type == "error") )
    process.exit(1);
