// import '@babel/polyfill'  在src下的index.js中全局引入 @babel/polyfill 并写入 ES6 语法
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader"; //1、首先引入AppContainre
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

/*初始化*/
renderWithHotReload(Router); //2、初始化

/*热更新*/
if (module.hot) {
  //3、热更新操作
  module.hot.accept("./router/index.js", () => {
    const Router = require("./router/index.js").default;
    renderWithHotReload(Router);
  });
}

// 判断该浏览器支不支持 serviceWorker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('service-worker registed')
        })
        .catch(error => {
          console.log('service-worker registed error')
        })
    })
  }

function renderWithHotReload(Router) {
  //4、定义渲染函数
  ReactDOM.render(
    <AppContainer>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AppContainer>,
    document.getElementById("app")
  );
}
