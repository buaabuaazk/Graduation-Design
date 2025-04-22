<template>
  <!-- 占位元素 -->
  <div class="nav-placeholder"></div>
  <div class="work-container">
    <!-- 左侧上传区域 -->
    <div class="left-section">
      <div class="upload-section">
        <el-upload
          class="upload-demo"
          drag
          action=""
          multiple
          :auto-upload="false"
          :show-file-list="true"
          accept="image/jpeg, image/png"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip">支持 JPG、PNG 格式图片</div>
        </el-upload>

        <el-input 
          v-model="inputValue" 
          type="textarea" 
          :rows="6" 
          placeholder="请输入用例描述或角色描述"
          class="description-input"
        ></el-input>

        <el-button 
          type="primary" 
          class="call-model-btn" 
          @click="callQwen" 
          :disabled="!selectedFile || isLoading"
        >
          {{ isLoading ? '正在调用大模型...' : '调用大模型' }}
        </el-button>

        <div class="effort-section">
          <el-button type="success" @click="showEffort" class="calculate-btn">
            计算工作量
          </el-button>
          <div class="effort-result" v-if="actorsValueSum">
            预计工作量：<span class="effort-value">{{ actorsValueSum.toFixed(1) }}</span> 人*时
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="right-section">
      <div class="form-section">
        <h2 class="section-title">基础信息</h2>
        <el-form label-width="120px" class="basic-form">
          <el-form-item label="Actor 数量">
            <el-input v-model.number="data.actor" type="number" min="0"></el-input>
          </el-form-item>
          <el-form-item label="UseCase 数量">
            <el-input v-model.number="data.useCase" type="number" min="0"></el-input>
          </el-form-item>
        </el-form>

        <h2 class="section-title">Actors 配置</h2>
        <el-form class="actors-form">
          <el-form-item 
            v-for="(item, index) in data.actors" 
            :key="'actor-' + index" 
            :label="index+1+' '+data.actors[index]"
          >
            <el-select v-model="data.actors_value[index]" placeholder="请选择交互方式" class="full-width">
              <el-option label="用户通过API与系统交互 (1)" :value="1"></el-option>
              <el-option label="用户通过协议与系统交互 (2)" :value="2"></el-option>
              <el-option label="用户通过GUI与系统交互 (3)" :value="3"></el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <h2 class="section-title">UseCases 配置</h2>
        <el-form class="usecases-form">
          <el-form-item 
            v-for="(item, index) in data.useCases" 
            :key="'usecase-' + index" 
            :label="index+1+' '+data.useCases[index]"
          >
            <el-select v-model="data.useCases_value[index]" placeholder="请选择复杂度" class="full-width">
              <el-option label="事务/场景个数为1~3 (5)" :value="5"></el-option>
              <el-option label="事务/场景个数为4~7 (10)" :value="10"></el-option>
              <el-option label="事务/场景个数>7 (15)" :value="15"></el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <h2 class="section-title">TCF 因子配置</h2>
        <el-form class="tcf-form">
          <el-form-item 
            v-for="(item, index) in data.TCF_value" 
            :key="'tcf-' + index" 
            :label="getTCFDescription(index)"
          >
            <el-select v-model="data.TCF_value[index]" placeholder="请选择影响程度" class="full-width">
              <el-option label="无关 (0)" :value="0"></el-option>
              <el-option label="一般 (3)" :value="3"></el-option>
              <el-option label="很强 (5)" :value="5"></el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <h2 class="section-title">ECF 因子配置</h2>
        <el-form class="ecf-form">
          <el-form-item 
            v-for="(item, index) in data.ECF_value" 
            :key="'ecf-' + index" 
            :label="getECFDescription(index)"
          >
            <el-select 
              v-model="data.ECF_value[index]" 
              placeholder="请选择程度" 
              class="full-width"
            >
              <el-option 
                v-for="option in getECFOptions(index)" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在处理中...</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { ref } from 'vue';
import axios from 'axios';

// **TCF 描述数组**
const TCF_descriptions = [
  "分布式系统",
  "性能要求",
  "最终用户使用效率",
  "内部处理复杂度",
  "复用程度",
  "易于安装",
  "系统易于使用",
  "可移植性",
  "系统易于修改",
  "并发性",
  "安全功能特性",
  "为第三方系统提供直接系统访问",
  "特殊的用户培训设施"
];

// **ECF 描述数组**
const ECF_descriptions = [
  "UML精通程度",
  "系统应用经验",
  "面向对象经验",
  "系统分析员能力",
  "团队士气",
  "需求稳定度",
  "兼职人员比例高低",
  "编程语言难易程度"
];
const inputValue = ref('');
const data = reactive({
  actor: 1, // 默认值 3
  useCase: 1, // 默认值 5
  actors: Array(1).fill(1), // 默认填充 1
  useCases: Array(1).fill(10), // 默认填充 10
  actors_value: Array(1).fill(1),
  useCases_value: Array(1).fill(10),
  TCF_value: Array(13).fill(0), // TCF 默认填充 0
  ECF_value: Array(8).fill(null), // ECF 默认填充 0
  //inputValue: "1212"
});
const actorsValueSum = ref(0);
// 监听 actor 变化
watch(
  () => data.actor,
  (newVal) => {
    if (newVal > data.actors.length) {
      data.actors.push(...Array(newVal - data.actors.length).fill(1));
    } else {
      data.actors.length = newVal;
    }
  }
);

// 监听 useCase 变化
watch(
  () => data.useCase,
  (newVal) => {
    if (newVal > data.useCases.length) {
      data.useCases.push(...Array(newVal - data.useCases.length).fill(10));
    } else {
      data.useCases.length = newVal;
    }
  }
);

// 获取 TCF 描述
function getTCFDescription(index) {
  return `TCF${index + 1}（${TCF_descriptions[index]}）`;
}

// 获取 ECF 描述
function getECFDescription(index) {
  return `ECF${index + 1}（${ECF_descriptions[index]}）`;
}

// 获取 ECF 对应选项
function getECFOptions(index) {
  if(index === 0 || index === 4 || index === 5 || index === 6) {
    return [
      { label: "低", value: 0 },
      { label: "中", value: 3 },
      { label: "高", value: 5 }
    ];
  }
  else if(index === 1 || index === 2) {
    return [
      { label: "匮乏", value: 0 },
      { label: "中等", value: 3 },
      { label: "丰富", value: 5 }
    ];
  }
  else if(index === 3) {
    return [
      { label: "弱", value: 0 },
      { label: "中", value: 3 },
      { label: "强", value: 5 }
    ];
  }
  else if (index === 7) {
    // **ECF8（编程语言难易程度）**
    return [
      { label: "易", value: 0 },
      { label: "中", value: 3 },
      { label: "难", value: 5 }
    ];
  }
}

function extractData(inputString) {
    // 把输入字符串按换行符分割成行数组
    //const lines = inputString.split('\n');
    const lines = inputString.split('\n').filter(line => line.trim()!== '');

    // 从第一行提取 actor 和 useCase 的值，并转换为数字类型
    [data.actor, data.useCase] = lines[0].split(' ').map(Number);

    // 从第二行提取 actor 的名字，以逗号分隔
    data.actors = lines[1].split(/[,\uff0c]/);
    data.actor = data.actors.length;

    // 从第三行提取 useCase 的名字，以逗号分隔
    data.useCases = lines[2].split(/[,\uff0c]/);
    data.useCase = data.useCases.length;

    // 用于存储每个 actor 及其对应的权值
    //const actorWeights = {};
    for (let i = 0; i < data.actor; i++) {
        const [name, weight] = lines[3 + i].split(' ');
        data.actors_value[i] = Number(weight);
        console.log(name);
    }

    // 用于存储每个 useCase 及其对应的权值
    //const useCaseWeights = {};
    for (let i = 0; i < data.useCase; i++) {
        const [name, weight] = lines[3 + data.actor + i].split(' ');
        data.useCases_value[i] = Number(weight);
        console.log(name);
    }

    // 从最后一行提取 13 个数字并转换为数字类型
    console.log("测试：本行应为13个TCF值 " + lines[3 + data.actor + data.useCase]);
    data.TCF_value = lines[3 + data.actor + data.useCase].split(' ').map(Number);

    // 返回包含所有提取信息的对象
    
}

    
// 定义常量
const API_KEY = 'sk-5d74b223d76b4fb28a1c9044a16db8ec';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = 'qwen-vl-max-latest';

const responseContent = ref('');
const selectedFile = ref(null);
const responseContentWithBreaks = ref('');
const isLoading = ref(false);

const handleFileChange = (file) => {
  if (!file || !file.raw) {
    console.error("文件获取失败");
    return;
  }

  selectedFile.value = file.raw; // 获取原始 File 对象
};

const encodeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result.split(',')[1];
      resolve(base64Image);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const callQwen = async () => {
  if (!selectedFile.value) {
    return;
  }
  try {
    // 开始请求，显示加载圈
    isLoading.value = true;
    const base64Image = await encodeImage(selectedFile.value);
    const imageType = selectedFile.value.type.split('/')[1];

    const messages = [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: 'You are a helpful assistant.'
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/${imageType};base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: `这是一个用例图，你需要严格按照我给定的格式回答以下几个问题，不要加任何多余的标号。即使我的问题分成了一二三，你也不要加标号。切记！
                    一、用例图里面有几个角色，几个用例（用椭圆形圈起来的是用例，千万不要数漏了，无论有几个字都算一个用例）？
                      先给出一行两个数字（用空格分隔）；再换行列出所有角色，用逗号分隔；再换行列出所有用例，用逗号分隔。
                   二、角色复杂度分为三个级别:simple,角色通过API与系统交互,权值1;
                                          average,角色通过协议与系统交互,权值2;
                                          complex,角色通过GUI与系统交互,权值3。
                      根据此图给出每个角色的权值，输出多行，每行包括角色名称及其权值。
                   三、用例复杂度分为三个级别：simple，事务/场景个数为1~3，权值5；
                                             average，事务/场景个数为4~7，权值10；
                                             complex，事务/场景个数>=8，权值15.
                       根据此图给出每个用例的权值，输出多行，每行包括用例名称及其权值。注意输出的行数必须等于你前面得出的用例数。
                   四、技术复杂度因子TCF有以下13个：
                      1 TCF1 分布式系统 
                      2 TCF2 性能要求
                      3 TCF3 最终用户使用效率
                      4 TCF4 内部处理复杂度
                      5 TCF5 复用程度
                      6 TCF6 易于安装
                      7 TCF7 系统易于使用
                      8 TCF8 可移植性
                      9 TCF9 系统易于修改
                      10 TCF10 并发性
                      11 TCF11 安全功能特性
                      12 TCF12 为第三方系统提供直接系统访问
                      13 TCF13 特殊的用户培训设施。
                      给出用例图对应的系统的13个权值，:0表示该技术因子与本项目无关;3表示该技术因子对本项目的影响一般;5表示该技术因子对本项目有很强的影响。
                      输出一行13个数字，用空格分隔。
                  `
          }
        ]
      }
    ];

    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    

    responseContent.value = response.data.choices[0].message.content;

    //这里提取一下返回的数据
    extractData(responseContent.value);

    //const inputString = responseContent.value;
    //extractData(inputString);

    //const lines = inputString.split('\n');
    //console.log("第一行是：" + lines[0]);
    //console.log("第一行是：" + inputString);


    // 将换行符替换为 <br> 标签
    responseContentWithBreaks.value = responseContent.value.replace(/\n/g, '<br>');

    // 调用成功时，在控制台输出信息
    console.log('大模型调用成功！');
    console.log('大模型返回内容：', responseContent.value);

    //console.log("第er行是：" + responseContent.value);
    //console.log("第er行是：" + inputString);
  } catch (error) {
    if (error.response) {
      // 请求已发送，但服务器响应的状态码不在 2xx 范围内
      console.error('服务器响应错误:', error.response.data);
      console.error('状态码:', error.response.status);
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('没有收到服务器响应:', error.request);
    } else {
      // 在设置请求时发生了错误
      console.error('请求设置错误:', error.message);
    }
    responseContent.value = '请求出错，请检查控制台日志。';
    responseContentWithBreaks.value = responseContent.value.replace(/\n/g, '<br>');
  } finally {
    // 请求结束，隐藏加载圈
    isLoading.value = false;
  }
};
/*
const printECF = () => {
  console.log("ECF: "+data.ECF_value);
}
const printTCF = () => {
  console.log("TCF: "+data.TCF_value);
}
*/
// 新增函数计算actors_value各元素之和
const calculate= () => {
  let UAW = data.actors_value.reduce((sum, value) => sum + value, 0);
  let UUCW = data.useCases_value.reduce((sum, value) => sum + value, 0);
  let UUCP = UAW + UUCW;
  const TCF_weight = [2.0,1.0,1.0,1.0,1.0,0.5,0.5,2.0,1.0,1.0,1.0,1.0,1.0];
  let TCF = 60;
  for(let i = 0;i < 13;i++){
    TCF = TCF + TCF_weight[i] * data.TCF_value[i];
  }
  TCF = TCF * 0.01;

  const ECF_weight = [1.5,0.5,1.0,0.5,1.0,2.0,-1.0,-1.0];
  let ECF = 0;
  for(let i = 0;i < 8;i++){
    ECF = ECF + ECF_weight[i] * data.ECF_value[i];
  }
  ECF = -0.03 * ECF + 1.4;
  console.log("TCF = " + TCF +" ECF = "+ ECF);
  let UCP = UUCP*TCF*ECF;
  let PF = 20;
  let effort = UCP * PF;
  return effort;
}

// 新增函数显示actors_value之和
const showEffort = () => {
  actorsValueSum.value = calculate();
  //actorsValueSumVisible.value = true;
}
</script>

<style scoped>
.work-container {
  display: flex;
  gap: 30px;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

.nav-placeholder {
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
}

.left-section {
  flex: 1;
  max-width: 500px;
  position: sticky;
  top: 80px;
  height: fit-content;
}

.right-section {
  flex: 2;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  padding: 20px;
  /*max-height: calc(100vh - 40px);*/
  overflow-y: auto;
}

.upload-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload-list) {
  margin-top: 20px;
}

.preview-section {
  margin-top: 20px;
  text-align: center;
}

.preview-section img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.description-input {
  margin-top: 20px;
}

.call-model-btn {
  width: 100%;
  margin-top: 20px;
}

.section-title {
  color: #303133;
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
}

.basic-form,
.actors-form,
.usecases-form,
.tcf-form,
.ecf-form {
  margin-bottom: 30px;
}

.full-width {
  width: 100%;
}

.effort-section {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.calculate-btn {
  width: 100%;
  margin-bottom: 20px;
}

.effort-result {
  font-size: 18px;
  color: #303133;
}

.effort-value {
  color: #409EFF;
  font-weight: bold;
  font-size: 24px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #409EFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-button) {
  border-radius: 4px;
}
</style>