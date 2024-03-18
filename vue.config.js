const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
   // 关闭严格模式
  runtimeCompiler:false,
  //close eslint lint
  lintOnSave:false
})
