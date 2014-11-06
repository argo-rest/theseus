System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "jquery": "github:components/jquery@^2.1.1",
    "npm:uri-templates": "npm:uri-templates@^0.1.5",
    "reqwest": "github:ded/reqwest@^1.1.2",
    "github:jspm/nodelibs@0.0.5": {
      "json": "github:systemjs/plugin-json@master"
    },
    "npm:Base64@0.2.1": {},
    "npm:base64-js@0.0.7": {},
    "npm:ieee754@1.1.4": {},
    "npm:inherits@2.0.1": {},
    "npm:json@9.0.2": {},
    "npm:uri-templates@0.1.5": {
      "json": "github:systemjs/plugin-json@master"
    }
  }
});

System.config({
  "versions": {
    "github:components/jquery": "2.1.1",
    "github:ded/reqwest": "1.1.5",
    "github:jspm/nodelibs": "0.0.5",
    "github:systemjs/plugin-json": "master",
    "npm:Base64": "0.2.1",
    "npm:base64-js": "0.0.7",
    "npm:ieee754": "1.1.4",
    "npm:inherits": "2.0.1",
    "npm:json": "9.0.2",
    "npm:uri-templates": "0.1.5"
  }
});

