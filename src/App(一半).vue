<template>
  <div ref="container" id="container" style="height: 100vh"></div>
</template>

<script>
import G6 from "@antv/g6";
import iconTableHead from "@/assets/icon-tablehead.svg";
import iconCollapsedDown from "@/assets/icon-triangle-down.svg";
import iconCollapsedUp from "@/assets/icon-triangle-up.svg";
import iconVarchar from "@/assets/icon-varchar.svg";
import iconNumber from "@/assets/icon-number.svg";
import iconDate from "@/assets/icon-date.svg";

export default {
  data() {
    return {
      graph: null,
      rawData: [
        {
          id: "1",
          label: "Employee",
          attrs: [
            {
              id: 1,
              field: "id",
              type: "number",
            },
            {
              id: 2,
              field: "name",
              type: "string",
            },
            {
              id: 3,
              field: "gender",
              type: "string",
            },
            {
              id: 4,
              field: "birthday",
              type: "date",
            },
            {
              id: 5,
              field: "hometown",
              type: "string",
            },
            {
              id: 6,
              field: "country",
              type: "string",
            },
            {
              id: 7,
              field: "nation",
              type: "string",
            },
            {
              id: 8,
              field: "jobId",
              type: "number",
            },
            {
              id: 9,
              field: "phone",
              type: "string",
            },
            {
              id: 10,
              field: "deptId",
              type: "number",
            },
            {
              id: 11,
              field: "startTime",
              type: "date",
            },
            {
              id: 12,
              field: "leaveTime",
              type: "date",
            },
          ],
        },
        {
          id: "2",
          label: "Job",
          attrs: [
            {
              id: 1,
              field: "id",
              type: "number",
            },
            {
              id: 2,
              field: "title",
              type: "string",
            },
            {
              id: 3,
              field: "level",
              type: "number",
            },
            {
              id: 4,
              field: "createTime123456789123456789",
              type: "date",
            },
          ],
        },
      ],
    };
  },
  created() {
    let _this = this;
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
      scorll(e) {
        e.preventDefault();

        const { graph } = this;
        //nodes 过滤出的鼠标点在node内的node
        const nodes = graph.getNodes().filter((n) => {
          //获取盒子
          const bbox = n.getBBox();
          //点是否在node盒子内的结果
          return _this.isInBBox(
            graph.getPointByClient(e.clientX, e.clientY),
            bbox
          );
        });
        if (nodes) {
          //执行滑动事件
          nodes.forEach((node) => {
            const model = node.getModel();

            //超过9条才滑动
            if (model.attrs.length < 9) {
              return;
            }
            const idx = model.startIndex || 0;
            let startX = model.startX || 0.5;
            let startIndex = idx + e.deltaY * 0.02;
            startX -= e.deltaX;
            if (startIndex < 0) {
              startIndex = 0;
            }
            if (startX > 0) {
              startX = 0;
            }
            if (startIndex > model.attrs.length - 1) {
              startIndex = model.attrs.length - 1;
            }
            graph.update(node, {
              startIndex,
              startX,
            });
          });
        }
      },
      click(e) {
        const name = e.shape.get("name");
        const item = e.item;
        if (name === 'card-node-title-right') {
          this.graph.updateItem(item, {
            clickName: name
          });
        }
      },
      move(e) {
        const name = e.shape.get("name");
        const item = e.item;

        if (name.includes('item')) {
          this.graph.updateItem(item, {
            selectItem: name,
            strokeColor: "#000",
          });
        } else {
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
          const color = cfg.label === "Job" ? "#09ae9c" : "#096DD9";
          const x = -150 / 2;
          const y = -300 / 2;
          const keyShape = group.addShape("rect", {
            attrs: {
              x,
              y,
              width: 150,
              height: 300,
              stroke: '#fff',
              fill: "#fff",
              redius: 5,
            },
            name: "card-node-keyshape",
          });
          const titleRect = group.addShape("rect", {
            attrs: {
              x,
              y,
              width: 150,
              height: 30,
              fill: color,
              stroke: "#fff",
              redius: 5,
            },
            name: "card-node-title-back",
          });
          const image = group.addShape("image", {
            attrs: {
              x: x + 8,
              y: y + 5,
              width: 20,
              height: 20,
              img: iconTableHead,
              cursor: "pointer",
            },
          });
          const text = group.addShape("text", {
            attrs: {
              text: cfg.title,
              x: x + 35,
              y: y + 9,
              fill: "#fff",
              text:
                cfg.label.length > 10
                  ? cfg.label.slice(0, 10) + "..."
                  : cfg.label,
              fontSize: 12,
              fontWeight: 500,
              textBaseline: "top",
            },
          });
          const rightImage = group.addShape("image", {
            attrs: {
              x: x + 120,
              y: y + 5,
              height: 20,
              width: 20,
              img: iconCollapsedDown,
              cursor: "pointer",
              // collapsed ? iconCollapsedUp : iconCollapsedDown
            },
            name: "card-node-title-right",
          })

          const {
            attrs = [],
            startIndex = 0,
          } = cfg;
          const list = attrs;
          const afterList = list.slice(
            Math.floor(startIndex),
            Math.floor(startIndex + 9)
          );

          let panelY = 30;

          // const subGroup = group.addGroup();

          afterList.forEach((e, i) => {
            let { field = "", type } = e;
            const label =
              field.length > 18 ? field.slice(0, 16) + "..." : field;
            group.addShape("rect", {
              attrs: {
                x,
                y: y + panelY,
                width: 150,
                height: 30,
                fill: "#fff",
                stroke: "#fff",
                redius: 2,
                zIndex: 999
              },
              name: `item-${i}`,
            });
            //图片
            group.addShape("image", {
              attrs: {
                x: x + 8,
                y: y + panelY + 7.5,
                width: 15,
                height: 15,
                img:
                  type === "string"
                    ? iconVarchar
                    : type === "number"
                      ? iconNumber
                      : iconDate,
              },
            });
            //添加字段文本
            group.addShape("text", {
              attrs: {
                x: x + 30,
                y: y + panelY + 22.5,
                text: label,
                fill: "#000",
                fontFamily:
                  "Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
              },
            });
            //分割线
            group.addShape("rect", {
              attrs: {
                x: x + 5,
                y: y + panelY,
                width: 140,
                height: 1,
                fill: "#ddd",
              },
            });

            panelY += 30;
          });
          return keyShape;
        },
        update: (cfg, item) => {
          const group = item.getContainer();
          const titleShape = group.findAll(
            (ele) => ele.get("name").includes('item')
          );
          titleShape.forEach((item) => {
            if (item.get("name") === cfg.selectItem) {
              item.attr("stroke", cfg.strokeColor);
            } else {
              item.attr("stroke", "#fff");
            }
          });
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
      fitCenter: true,
      modes: {
        default: ["move-mouse", "drag-canvas", "drag-node"],
      },
      defaultNode: {
        type: "card-node",
      },
      layout: {
        type: "dagre",
        // rankdir: "LR",
        align: "UL",
        controlPoints: true,
        // nodesepFunc: () => 0.2,
        // ranksepFunc: () => 0.5,
      },
      // fitView: true,
    });

    graph.data(this.dataTransform(this.rawData));
    graph.render();
  },
  methods: {
    isInBBox(point, bbox) {
      const { x, y } = point;
      const { minX, minY, maxX, maxY } = bbox;

      return x < maxX && x > minX && y > minY && y < maxY;
    },
    dataTransform(data) {
      const nodes = [];
      const edges = [];

      data.map((node) => {
        nodes.push({
          ...node,
        });
        if (node.attrs) {
          node.attrs.forEach((attr) => {
            if (attr.relation) {
              attr.relation.forEach((relation) => {
                edges.push({
                  source: node.id,
                  target: relation.nodeId,
                  sourceKey: attr.field,
                  targetKey: relation.field,
                  label: relation.label,
                });
              });
            }
          });
        }
      });

      return {
        nodes,
        edges,
      };
    },
  }
};
</script>

<style></style>
