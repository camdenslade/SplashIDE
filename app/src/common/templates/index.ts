//********************************************************************
//
// CodeTemplate Interface
//
// Interface for code templates. Defines a template with an ID,
// description, file name generator function, and content generator
// function. Used for generating code from templates based on names.
//
// Return Value
// ------------
// None (interface definition)
//
// Value Parameters
// ----------------
// None
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// None
//
//*******************************************************************

export interface CodeTemplate {
  id: string;
  description: string;
  fileName: (name: string) => string;
  generate: (name: string) => string;
}

// ----------------------------
// React Component
// ----------------------------
export const ReactComponentTemplate: CodeTemplate = {
  id: "react_component",
  description: "Basic React functional component",

  fileName: (name) => `src/components/${name}.tsx`,

  generate: (name) => `
import React from "react";

interface ${name}Props {}

export default function ${name}(props: ${name}Props) {
  return (
    <div className="${name}">
      <h1>${name} Component</h1>
    </div>
  );
}
`,
};

// ----------------------------
// React Native Screen
// ----------------------------
export const ReactNativeScreenTemplate: CodeTemplate = {
  id: "react_native_screen",
  description: "React Native screen component",

  fileName: (name) => `src/screens/${name}Screen.tsx`,

  generate: (name) => `
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ${name}Screen() {
  return (
    <View style={styles.container}>
      <Text>${name} Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
`,
};

// ----------------------------
// NestJS Module
// ----------------------------
export const NestModuleTemplate: CodeTemplate = {
  id: "nestjs_module",
  description: "NestJS module + controller + service",

  fileName: (name) => `src/${name.toLowerCase()}/${name.toLowerCase()}.module.ts`,

  generate: (name) => `
import { Module } from '@nestjs/common';
import { ${name}Service } from './${name.toLowerCase()}.service';
import { ${name}Controller } from './${name.toLowerCase()}.controller';

@Module({
  imports: [],
  controllers: [${name}Controller],
  providers: [${name}Service],
})
export class ${name}Module {}
`,
};

// ----------------------------
// NestJS Service
// ----------------------------
export const NestServiceTemplate: CodeTemplate = {
  id: "nestjs_service",
  description: "NestJS Service",

  fileName: (name) => `src/${name.toLowerCase()}/${name.toLowerCase()}.service.ts`,

  generate: (name) => `
import { Injectable } from "@nestjs/common";

@Injectable()
export class ${name}Service {
  constructor() {}

  findAll() {
    return [];
  }
}
`,
};

// ----------------------------
// NestJS Controller
// ----------------------------
export const NestControllerTemplate: CodeTemplate = {
  id: "nestjs_controller",
  description: "NestJS REST Controller",

  fileName: (name) => `src/${name.toLowerCase()}/${name.toLowerCase()}.controller.ts`,

  generate: (name) => `
import { Controller, Get } from "@nestjs/common";
import { ${name}Service } from "./${name.toLowerCase()}.service";

@Controller('${name.toLowerCase()}')
export class ${name}Controller {
  constructor(private readonly service: ${name}Service) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
`,
};

// ----------------------------
// Export All Templates
// ----------------------------
export const Templates = {
  ReactComponentTemplate,
  ReactNativeScreenTemplate,
  NestModuleTemplate,
  NestServiceTemplate,
  NestControllerTemplate,
};
