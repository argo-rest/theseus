System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "reqwest": "github:ded/reqwest@^1.1.2",
    "uri-templates": "npm:uri-templates@^0.1.5",
    "npm:uri-templates@0.1.5": {
      "json": "npm:json@^9.0.2"
    },
    "github:jspm/nodelibs@0.0.3": {
      "Base64": "npm:Base64@0.2",
      "inherits": "npm:inherits@^2.0.1",
      "json": "github:systemjs/plugin-json@master",
      "ieee754": "npm:ieee754@^1.1.1",
      "base64-js": "npm:base64-js@0.0"
    },
    "npm:Base64@0.2.1": {},
    "npm:inherits@2.0.1": {},
    "npm:ieee754@1.1.4": {},
    "npm:base64-js@0.0.7": {},
    "jquery": "github:components/jquery@^2.1.1"
  }
});

System.config({
  "versions": {
    "github:ded/reqwest": "1.1.2",
    "npm:uri-templates": "0.1.5",
    "github:jspm/nodelibs": "0.0.3",
    "npm:Base64": "0.2.1",
    "npm:inherits": "2.0.1",
    "github:systemjs/plugin-json": "master",
    "npm:ieee754": "1.1.4",
    "npm:base64-js": "0.0.7",
    "github:components/jquery": "2.1.1"
  }
});

