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
      itemHeight: 30,
    };
  },
  created() {
    const Graph = G6;
    const itemHeight = this.itemHeight;
    const that = this;
    Graph.registerBehavior("dice-er-scroll", {
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
          return that.isInBBox(
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
        const { graph } = this;
        const { y } = e;
        const item = e.item;
        const shape = e.shape;
        if (!item) {
          return;
        }
        const model = item.getModel();

        if (shape.get("name") === "collapse") {
          graph.updateItem(item, {
            collapsed: true,
            size: [300, 50],
          });
          setTimeout(() => graph.layout(), 100);
        } else if (shape.get("name") === "expand") {
          graph.updateItem(item, {
            collapsed: false,
            size: [300, 500],
          });
          setTimeout(() => graph.layout(), 100);
        }
      },
      move(e) {
        const name = e.shape.get("name");
        const item = e.item;

        console.log(name, item);

        if (name && name.startsWith("item")) {
          this.graph.updateItem(item, {
            selectedIndex: Number(name.split("-")[1]),
          });
        } else {
          this.graph.updateItem(item, {
            selectedIndex: NaN,
          });
        }
      },
    });

    Graph.registerEdge("dice-er-edge", {
      draw(cfg, group) {
        const edge = group.cfg.item;
        const sourceNode = edge.getSource().getModel();
        const targetNode = edge.getTarget().getModel();

        const sourceIndex = sourceNode.attrs.findIndex(
          (e) => e.field === cfg.sourceKey
        );

        const sourceStartIndex = sourceNode.startIndex || 0;

        let sourceY = 15;

        if (!sourceNode.collapsed && sourceIndex > sourceStartIndex - 1) {
          sourceY = 30 + (sourceIndex - sourceStartIndex + 0.5) * 30;
          sourceY = Math.min(sourceY, 300);
        }

        const targetIndex = targetNode.attrs.findIndex(
          (e) => e.field === cfg.targetKey
        );

        const targetStartIndex = targetNode.startIndex || 0;

        let targetY = 15;

        if (!targetNode.collapsed && targetIndex > targetStartIndex - 1) {
          targetY = (targetIndex - targetStartIndex + 0.5) * 30 + 30;
          targetY = Math.min(targetY, 300);
        }

        const startPoint = {
          ...cfg.startPoint,
        };
        const endPoint = {
          ...cfg.endPoint,
        };

        startPoint.y = startPoint.y + sourceY;
        endPoint.y = endPoint.y + targetY;

        let shape;
        if (sourceNode.id !== targetNode.id) {
          shape = group.addShape("path", {
            attrs: {
              stroke: "#5B8FF9",
              path: [
                ["M", startPoint.x, startPoint.y],
                [
                  "C",
                  endPoint.x / 3 + (2 / 3) * startPoint.x,
                  startPoint.y,
                  endPoint.x / 3 + (2 / 3) * startPoint.x,
                  endPoint.y,
                  endPoint.x,
                  endPoint.y,
                ],
              ],
              endArrow: true,
            },
            name: "path-shape",
          });
        } else if (!sourceNode.collapsed) {
          let gap = Math.abs((startPoint.y - endPoint.y) / 3);
          if (startPoint["index"] === 1) {
            gap = -gap;
          }
          shape = group.addShape("path", {
            attrs: {
              stroke: "#5B8FF9",
              path: [
                ["M", startPoint.x, startPoint.y],
                [
                  "C",
                  startPoint.x - gap,
                  startPoint.y,
                  startPoint.x - gap,
                  endPoint.y,
                  startPoint.x,
                  endPoint.y,
                ],
              ],
              endArrow: true,
            },
            name: "path-shape",
          });
        }

        return shape;
      },
      afterDraw(cfg, group) {
        const labelCfg = cfg.labelCfg || {};
        const edge = group.cfg.item;
        const sourceNode = edge.getSource().getModel();
        const targetNode = edge.getTarget().getModel();
        if (sourceNode.collapsed && targetNode.collapsed) {
          return;
        }
        const path = group.find(
          (element) => element.get("name") === "path-shape"
        );

        const labelStyle = Graph.Util.getLabelPosition(path, 0.5, 0, 0, true);
        const label = group.addShape("text", {
          attrs: {
            ...labelStyle,
            text: cfg.label || "",
            fill: "#000",
            textAlign: "center",
            stroke: "#fff",
            lineWidth: 1,
          },
        });
        label.rotateAtStart(labelStyle.rotate);
      },
    });

    Graph.registerNode("dice-er-box", {
      draw(cfg, group) {
        const width = 150;
        const height = 300;
        const itemCount = 10;
        const boxStyle = {
          // stroke: "#096DD9",
          radius: 4,
          tableHeadCss: {
            radius: 4,
            // fill: "#096DD9",
          },
        };

        const {
          attrs = [],
          startIndex = 0,
          selectedIndex,
          collapsed,
          label,
          icon,
        } = cfg;
        const list = attrs;
        const afterList = list.slice(
          Math.floor(startIndex),
          Math.floor(startIndex + itemCount - 1)
        );
        const offsetY = (0.5 - (startIndex % 1)) * itemHeight + 30;
        //表头样式
        group.addShape("rect", {
          attrs: {
            fill: label === "Job" ? "#09ae9c" : "#096DD9",
            height: 30,
            width,
            radius: [
              boxStyle.tableHeadCss.radius,
              boxStyle.tableHeadCss.radius,
              boxStyle.tableHeadCss.radius,
              boxStyle.tableHeadCss.radius,
            ],
          },
          draggable: true,
        });

        let fontLeft = 12;
        //表头图
        group.addShape("image", {
          attrs: {
            x: 8,
            y: 5,
            height: 20,
            width: 20,
            img: iconTableHead,
            name: "tableheadImg",
          },
        });

        fontLeft += 18;
        // }
        //表头文字
        group.addShape("text", {
          attrs: {
            y: 22,
            x: fontLeft + 5,
            fill: "#fff",
            text:
              cfg.label.length > 10
                ? cfg.label.slice(0, 10) + "..."
                : cfg.label,
            fontSize: 12,
            fontWeight: 500,
          },
        });
        //折叠按钮样式
        group.addShape("image", {
          attrs: {
            x: 120,
            // y: collapsed ? 30 : 300,
            y: 5,
            height: 20,
            width: 20,
            // fill: "#D0AC50",
            // radius: [0, 0, boxStyle.radius, boxStyle.radius],
            // cursor: "pointer",
            img: collapsed ? iconCollapsedUp : iconCollapsedDown,
          },
          name: collapsed ? "expand" : "collapse",
        });

        // group.addShape("text", {
        //   attrs: {
        //     x: width / 2 - 6,
        //     y: (collapsed ? 30 : 300) + 12,
        //     text: collapsed ? "+" : "-",
        //     width,
        //     fill: "#000",
        //     radius: [0, 0, boxStyle.radius, boxStyle.radius],
        //     cursor: "pointer",
        //   },
        //   name: collapsed ? "expand" : "collapse",
        // });
        //边框
        const keyshape = group.addShape("rect", {
          attrs: {
            x: 0,
            y: 0,
            width,
            height: collapsed ? 45 : height,
            ...boxStyle,
          },
          draggable: true,
        });
        //折叠下面就不画了
        if (collapsed) {
          return keyshape;
        }
        //新建分组并加入旧分组
        const listContainer = group.addGroup({});
        //设置容器大小(裁剪出的大小)
        listContainer.setClip({
          type: "rect",
          attrs: {
            x: -8,
            y: 30,
            width: width + 16,
            height: 300 - 30,
          },
        });
        //添加字段属性列表显示盒
        listContainer.addShape({
          type: "rect",
          attrs: {
            x: 1,
            y: 30,
            width: width - 2,
            height: 300 - 30,
            fill: "#fff",
          },
          draggable: true,
        });
        //长度大于10处理
        if (list.length > itemCount) {
          const barStyle = {
            width: 4,
            padding: 0,
            // boxStyle: {
            //   stroke: "#000022",
            // },
            innerStyle: {
              fill: "#e0e8ee",
            },
          };

          listContainer.addShape("rect", {
            attrs: {
              y: 30,
              x: width - barStyle.padding - barStyle.width,
              width: barStyle.width,
              height: height - 30,
              ...barStyle.boxStyle,
            },
          });

          const indexHeight =
            afterList.length > itemCount
              ? (afterList.length / list.length) * height
              : 10;

          listContainer.addShape("rect", {
            attrs: {
              y:
                30 +
                barStyle.padding +
                (startIndex / list.length) * (height - 30),
              x: width - barStyle.padding - barStyle.width,
              width: barStyle.width,
              height: Math.min(height, indexHeight),
              ...barStyle.innerStyle,
            },
          });
        }
        if (afterList) {
          afterList.forEach((e, i) => {
            console.log(startIndex , i , selectedIndex);
            const isSelected =
              Math.floor(startIndex) + i === Number(selectedIndex);
            let { field = "", type } = e;
            // if (type) {
            //   field += " - " + type;
            // }
            //处理字段文字溢出
            const label =
              field.length > 18 ? field.slice(0, 16) + "..." : field;
            //字段属性样式
            listContainer.addShape("rect", {
              attrs: {
                x: 1,
                y: i * itemHeight - itemHeight / 2 + offsetY,
                width: width - 4,
                height: itemHeight,
                radius: 2,
                cursor: "pointer",
                //  ###### 插眼 ######
                stroke: isSelected ? "#fea501" : '#fff'
              },
              name: `item-${Math.floor(startIndex) + i}-content`,
              draggable: true,
            });
            //图片
            listContainer.addShape("image", {
              attrs: {
                x: width / 2 - (width * 0.9) / 2 + 3,
                y: i * itemHeight + offsetY - 8,
                width: 15,
                height: 15,
                img:
                  type === "string"
                    ? iconVarchar
                    : type === "number"
                    ? iconNumber
                    : iconDate,
              },
              name: `item-${Math.floor(startIndex) + i}-content_image`,
              draggable: true,
            });
            //分割线
            listContainer.addShape("rect", {
              attrs: {
                x: width / 2 - (width * 0.9) / 2,
                y: itemHeight + i * itemHeight - itemHeight / 2 + offsetY,
                width: width * 0.9,
                height: 1,
                fill: "#ddd",
              },
              name: `item-${Math.floor(startIndex) + i}-content_line`,
              draggable: true,
            });

            if (!cfg.hideDot && isSelected) {
              //左边的圆圆
              listContainer.addShape("circle", {
                attrs: {
                  x: 1,
                  y: i * itemHeight + offsetY,
                  r: 3,
                  fill: "#fea501",
                  // fill: "white",
                  radius: 2,
                  lineWidth: 1,
                  cursor: "pointer",
                },
              });
              //右边的圆圆
              listContainer.addShape("circle", {
                attrs: {
                  x: width-3,
                  y: i * itemHeight + offsetY,
                  r: 3,
                  fill: "#fea501",
                  // fill: "white",
                  radius: 2,
                  lineWidth: 1,
                  cursor: "pointer",
                },
              });
            }
            //添加字段文本
            listContainer.addShape("text", {
              attrs: {
                x: width / 4.5,
                y: i * itemHeight + offsetY + 6,
                text: label,
                fontSize: 12,
                fill: "#000",
                fontFamily:
                  "Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
                full: e,
                // ###### 插眼 ######
                fontWeight: isSelected ? 500 : 100,
                cursor: "pointer",
              },
              name: `item-${Math.floor(startIndex) + i}`,
            });
          });
        }

        return listContainer;
      },
      // update(cfg, group) {

      // },
      getAnchorPoints() {
        return [
          [0, 0],
          [1, 0],
        ];
      },
    });
  },
  mounted() {
    const graph = new G6.Graph({
      container: document.getElementById("container"),
      defaultNode: {
        size: [300, 400],
        type: "dice-er-box",
        color: "#5B8FF9",
        style: {
          fill: "#9EC9FF",
          lineWidth: 3,
        },
        labelCfg: {
          style: {
            fill: "black",
            fontSize: 20,
          },
        },
      },
      defaultEdge: {
        type: "dice-er-edge",
        style: {
          stroke: "#e2e2e2",
          lineWidth: 4,
          endArrow: true,
        },
      },
      modes: {
        //自定义行为 拖动节点行为 拖动画布行为
        default: ["dice-er-scroll", "drag-node", "drag-canvas"],
      },
      layout: {
        type: "dagre",
        rankdir: "LR",
        align: "UL",
        controlPoints: true,
        nodesepFunc: () => 0.2,
        ranksepFunc: () => 0.5,
      },
      animate: true,
    });

    graph.data(this.dataTransform(this.rawData));

    graph.render();

    graph.on("node:mouseenter", (evt) => {
      console.log(evt);
      const { item } = evt;
      graph.setItemState(item, "hover", true);
    });

    graph.on("node:mouseleave", (evt) => {
      const { item } = evt;
      graph.setItemState(item, "hover", false);
    });
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
  },
};
</script>

<style>
#container {
  width: 1000px;
  height: 1000px;
  background: #efefef;
  /* background: red; */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
