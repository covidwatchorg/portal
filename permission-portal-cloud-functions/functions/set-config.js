#! /usr/bin/env node

const fs = require('fs');
const child_process = require('child_process');
const assert = require('assert');
const env = process.env.NODE_ENV
const configPath = `./config/functions.config.${env}.json`;

// Format config correctly
const collectConfigLines = (o, propPath, configLines) => {
    for (const key of Object.keys(o)) {
        const newPropPath = propPath + key;
        if (typeof o[key] === 'object') {
            collectConfigLines(o[key], newPropPath + '.', configLines);
        } else if (o[key] != null && o[key] !== '') {
            configLines.push(`${newPropPath}=${JSON.stringify(o[key])}`);
        }
    }
}

// Test if objects are equal regardless of order
// using built in deep equality check
function jsonEqual(obj1, obj2){
    try{
        assert.deepStrictEqual(obj1, obj2)
        return true
    }
    catch(AssertionError){
        return false
    }
}

function main(){
    if (!fs.existsSync(configPath)) {
        console.log("Config path not found")
        return;
    }

    // Load non-secret config options
    const config = require(configPath);

    // Add secrets
    config["sendgrid"] = {
        "key": `${process.env.SENDGRID_API_KEY}`
    }

    try{
        var current_config = child_process.execSync(`firebase -P ${env} functions:config:get`)
    }
    catch(err){
        console.log("Error retrieving old functions config")
        return;
    }
    
    current_config = JSON.parse(current_config.toString())

    // Do nothing if the config hasn't changed
    if(jsonEqual(config, current_config)){
        console.log("No change in functions config")
        return;
    }


    // If the config has changed, set the new config values
    const configLines = [];
    collectConfigLines(config, '', configLines);
    try{
        //child_process.execSync(`firebase -P ${env} functions:config:set ${configLines.join(' ')}`);
    }
    catch(err){
        console.log("Error setting new functions config")
        process.exit(1);
    }
    console.log("New functions config set")
}

main()
