<template>
  <div ref="container" id="container" style="height: 100vh"></div>
</template>

<script>
import G6 from "@antv/g6";

export default {
  data() {
    return {
      graph: null,
    };
  },
  created() {
    const ICON_MAP = {
      a: "https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ",
      b: "https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*sxK0RJ1UhNkAAAAAAAAAAABkARQnAQ",
    };
    G6.registerBehavior("move-mouse", {
      getDefaultCfg() {
        return {
          multiple: true,
        };
      },
      getEvents() {
        return {
          itemHeight: 50,
          wheel: "scorll", //重写 鼠标滚动事件
          click: "click", //重写 鼠标点击默认事件
          "node:mousemove": "move", //重写 内部节点移动触发
        };
      },
      move(e) {
        const name = e.shape.get("name");
        const item = e.item;

        console.log(name, item);

        if (name.includes('item')) {
          this.graph.updateItem(item, {
            selectItem: name,
            strokeColor: "#000",
          });
        }else {
          this.graph.updateItem(item, {
            selectItem: name,
            strokeColor: "#fff",
          });
        }
      },
    });

    G6.registerNode(
      "card-node",
      {
        draw: (cfg, group) => {
          const color = cfg.error ? "#F4664A" : "#30BF7B";
          const icon = cfg.error ? ICON_MAP.b : ICON_MAP.a;
          const x = -200 / 2;
          const y = -60 / 2;
          const keyShape = group.addShape("rect", {
            attrs: {
              x,
              y,
              width: 200,
              height: 90,
              stroke: color,
              fill: "#fff",
              redius: 2,
            },
            name: "card-node-keyshape",
          });
          const titleRect = group.addShape("rect", {
            attrs: {
              x,
              y,
              width: 200,
              height: 20,
              fill: color,
              stroke: "#fff",
              redius: 2,
            },
            name: "card-node-title-back",
          });
          const image = group.addShape("image", {
            attrs: {
              x: x + 2,
              y: y + 2,
              width: 18,
              height: 18,
              img: icon,
              cursor: "pointer",
            },
          });
          const text = group.addShape("text", {
            attrs: {
              text: cfg.title,
              x: x + 30,
              y: y + 4,
              fill: "#fff",
              textBaseline: "top",
            },
          });
          let panelY = 20;
          // const subGroup = group.addGroup();
          cfg.panels?.forEach((panel, i) => {
            group.addShape("rect", {
              attrs: {
                x: x+10,
                y: y + panelY,
                width: 180,
                height: 20,
                fill: "#000",
                stroke: "#fff",
                redius: 2,
              },
              name: `item-${i}`,
            });

            // subGroup.addShape("text", {
            //   attrs: {
            //     text: panel.value,
            //     x: x + panelX,
            //     y: y + 54,
            //     fill: "#000",
            //     textAlign: "center",
            //   },
            //   name: `card-node-panel-value-${i}`,
            // });

            panelY += 20;
          });
          return keyShape;
        },
        update: (cfg, item) => {
          const group = item.getContainer();
          // console.log(group);
          // group.forEach(item => {
          //   if(item.get("name") === cfg.selectItem) {
          //     item.attr("stroke", cfg.strokeColor);
          //   }else {
          //     item.attr("stroke", "#fff");
          //   }
          // });
          const titleShape = group.findAll(
            (ele) => ele.get("name").includes('item')
          );
          // console.log(titleShape);
          titleShape.forEach((item) => {
            if (item.get("name") === cfg.selectItem) {
              item.attr("stroke", cfg.strokeColor);
            } else {
              item.attr("stroke", "#fff");
            }
          });
          // titleShape.attr("stroke", cfg.strokeColor);
        },
      },
      "rect"
    );
  },
  mounted() {
    const container = document.getElementById("container");
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new G6.Graph({
      container: "container",
      width,
      height,
      // translate the graph to align the canvas's center, support by v3.5.1
      fitCenter: true,
      modes: {
        default: ["move-mouse", "drag-canvas", "drag-node"],
      },
      defaultNode: {
        type: "card-node",
      },
      fitView: true,
    });

    const data = {
      nodes: [
        {
          title: "node1",
          error: true,
          nodeType: "a",
          id: "node1",
          nodeLevel: 2,
          panels: [
            { title: "成功率", value: "11%" },
            { title: "耗时", value: "111" },
            { title: "错误数", value: "111" },
          ],
          x: 100,
          y: 100,
        },
        {
          title: "node2",
          error: false,
          nodeType: "b",
          id: "node2",
          nodeLevel: 0,
          panels: [
            { title: "成功率", value: "11%" },
            { title: "耗时", value: "111" },
            { title: "错误数", value: "111" },
          ],
          x: 100,
          y: 200,
        },
        {
          title: "node3",
          error: false,
          nodeType: "a",
          id: "node3",
          nodeLevel: 3,
          panels: [
            { title: "成功率", value: "11%" },
            { title: "耗时", value: "111" },
            { title: "错误数", value: "111" },
          ],
          collapse: true,
          x: 100,
          y: 300,
        },
      ],
    };

    graph.data(data);
    graph.render();
  },
};
</script>

<style>
</style>
