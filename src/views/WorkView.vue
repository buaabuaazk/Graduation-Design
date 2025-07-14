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

        <div class="model-buttons">
          <el-button 
            type="primary" 
            class="call-model-btn" 
            @click="callQwenMaxLatest" 
            :disabled="!selectedFile || isLoading"
          >
            {{ isLoading ? '正在调用大模型...' : '调用大模型 (Qwen-VL-Max-Latest)' }}
          </el-button>

          <el-button 
            type="primary" 
            class="call-model-btn" 
            @click="callQwenOcr" 
            :disabled="!selectedFile || isLoading"
          >
            {{ isLoading ? '正在调用大模型...' : '调用大模型 (Qwen-VL-OCR-Latest)' }}
          </el-button>

          <el-button 
            type="primary" 
            class="call-model-btn" 
            @click="callLlama" 
            :disabled="!selectedFile || isLoading"
          >
            {{ isLoading ? '正在调用大模型...' : '调用大模型 (Llama-4-Maverick)' }}
          </el-button>
        </div>

        <div class="effort-section">
          <el-button type="success" @click="showEffortQwenMaxLatest" class="calculate-btn">
            计算工作量 (Qwen-VL-Max-Latest)
          </el-button>
          <div class="effort-result" v-if="effortQwenMaxLatest">
            预计工作量：<span class="effort-value">{{ effortQwenMaxLatest.toFixed(0) }}</span> 人*时
          </div>

          <el-button type="success" @click="showEffortQwenOcr" class="calculate-btn">
            计算工作量 (Qwen-VL-OCR-Latest)
          </el-button>
          <div class="effort-result" v-if="effortQwenOcr">
            预计工作量：<span class="effort-value">{{ effortQwenOcr.toFixed(0) }}</span> 人*时
          </div>

          <el-button type="success" @click="showEffortLlama" class="calculate-btn">
            计算工作量 (Llama-4-Maverick)
          </el-button>
          <div class="effort-result" v-if="effortLlama">
            预计工作量：<span class="effort-value">{{ effortLlama.toFixed(0) }}</span> 人*时
          </div>
        </div>

        <div class="export-dropdown">
          <el-dropdown @command="handleExport">
            <el-button type="primary" class="export-btn">
              导出分析报告
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
                <el-dropdown-item command="excel">导出为Excel</el-dropdown-item>
                <el-dropdown-item command="word">导出为Word</el-dropdown-item>
                <el-dropdown-item command="json">导出为JSON</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
            :label="'Actor ' + (index+1)"
          >
            <div class="actor-item">
              <el-input 
                v-model="data.actors[index]" 
                placeholder="请输入角色名称"
                class="name-input"
              ></el-input>
              <el-select 
                v-model="data.actors_value[index]" 
                placeholder="请选择交互方式" 
                class="type-select"
              >
                <el-option label="用户通过API与系统交互 (1)" :value="1"></el-option>
                <el-option label="用户通过协议与系统交互 (2)" :value="2"></el-option>
                <el-option label="用户通过GUI与系统交互 (3)" :value="3"></el-option>
              </el-select>
              <el-button 
                type="danger" 
                circle 
                @click="removeActor(index)"
                :disabled="data.actors.length <= 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addActor">
              <el-icon><Plus /></el-icon>
              添加角色
            </el-button>
          </el-form-item>
        </el-form>

        <h2 class="section-title">UseCases 配置</h2>
        <el-form class="usecases-form">
          <el-form-item 
            v-for="(item, index) in data.useCases" 
            :key="'usecase-' + index" 
            :label="'UseCase ' + (index+1)"
          >
            <div class="usecase-item">
              <el-input 
                v-model="data.useCases[index]" 
                placeholder="请输入用例名称"
                class="name-input"
              ></el-input>
              <el-select 
                v-model="data.useCases_value[index]" 
                placeholder="请选择复杂度" 
                class="type-select"
              >
                <el-option label="事务/场景个数为1~3 (5)" :value="5"></el-option>
                <el-option label="事务/场景个数为4~7 (10)" :value="10"></el-option>
                <el-option label="事务/场景个数>7 (15)" :value="15"></el-option>
              </el-select>
              <el-button 
                type="danger" 
                circle 
                @click="removeUseCase(index)"
                :disabled="data.useCases.length <= 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addUseCase">
              <el-icon><Plus /></el-icon>
              添加用例
            </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Delete, Plus } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import 'jspdf-font';

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
  TCF_value: Array(13).fill(3), // TCF 默认填充 0
  ECF_value: Array(8).fill(3), // ECF 默认填充 0
  //inputValue: "1212"
});
//const actorsValueSum = ref(0);
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

// 模型配置
const QWEN_MAX_LATEST = 'qwen-vl-max-latest';
const QWEN_MAX_OCR = 'qwen-vl-ocr-latest';
const LLAMA_MODEL = 'llama-4-maverick-17b-128e-instruct';

const API_KEY = 'sk-5d74b223d76b4fb28a1c9044a16db8ec';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 响应内容
const responseContentQwenMaxLatest = ref('');
const responseContentQwenOcr = ref('');
const responseContentLlama = ref('');
const selectedFile = ref(null);
const isLoading = ref(false);

// 工作量计算结果
const effortQwenMaxLatest = ref(0);
const effortQwenOcr = ref(0);
const effortLlama = ref(0);

// 最近调用的模型
const lastCalledModel = ref('');

// 调用 Qwen-VL-Max-Latest 模型
const callQwenMaxLatest = async () => {
  if (!selectedFile.value) return;
  lastCalledModel.value = QWEN_MAX_LATEST;
  await callModel(QWEN_MAX_LATEST, responseContentQwenMaxLatest);
};

// 调用 Qwen-VL-OCR-Latest 模型
const callQwenOcr = async () => {
  if (!selectedFile.value) return;
  lastCalledModel.value = QWEN_MAX_OCR;
  await callModel(QWEN_MAX_OCR, responseContentQwenOcr);
};

// 调用 Llama-4-Maverick 模型
const callLlama = async () => {
  if (!selectedFile.value) return;
  lastCalledModel.value = LLAMA_MODEL;
  await callModel(LLAMA_MODEL, responseContentLlama);
};

// 通用模型调用函数
const callModel = async (model, responseContentRef) => {
  const startTime = performance.now();
  try {
    isLoading.value = true;
    const base64Image = await encodeImage(selectedFile.value);
    const imageType = selectedFile.value.type.split('/')[1];

    const messages = [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: 'You are a helpful assistant that analyzes use case diagrams and returns data in a specific JSON format.'
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
            text: `这是一个用例图，请分析并返回以下JSON格式的数据：
{
  "is_use_case_diagram": true,
  "actor_count": 数字,
  "usecase_count": 数字,
  "actors": ["角色1", "角色2", ...],
  "usecases": ["用例1", "用例2", ...],
  "actor_weights": [
    {"name": "角色1", "weight": 数字},
    {"name": "角色2", "weight": 数字},
    ...
  ],
  "usecase_weights": [
    {"name": "用例1", "weight": 数字},
    {"name": "用例2", "weight": 数字},
    ...
  ],
  "tcf_values": [数字1, 数字2, ..., 数字13]
}

如果上传的图片不是用例图，请返回：
{
  "is_use_case_diagram": false,
  "error_message": "这不是一个用例图，请上传正确的用例图。"
}

系统描述：${inputValue.value}

说明：
1. 首先判断是否为用例图，如果不是，直接返回错误信息
2. 如果是用例图，则继续分析并返回详细数据
3. actor_count 和 usecase_count 分别是角色和用例的数量（被复用的用例（used use cases）或被扩展的用例（extended use cases）不计入统计范围）
4. actors 和 usecases 数组包含所有角色和用例的名称
5. actor_weights 中每个对象的 weight 值：
   - 1: 角色通过API与系统交互
   - 2: 角色通过协议与系统交互
   - 3: 角色通过GUI与系统交互
6. usecase_weights 中每个对象的 weight 值：
   - 5: 事务/场景个数为1~3
   - 10: 事务/场景个数为4~7
   - 15: 事务/场景个数>=8
7. tcf_values 是13个技术复杂度因子的值
          (依次是"分布式系统",
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
  "特殊的用户培训设施")：
   - 0: 该技术因子与本项目无关
   - 3: 该技术因子对本项目的影响一般
   - 5: 该技术因子对本项目有很强的影响
  注意必须是13个值，严格按照上述顺序返回，不要改变顺序。

请确保返回的是合法的JSON格式，不要包含任何额外的文字说明。`
          }
        ]
      }
    ];

    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: model,
          messages
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 设置30秒超时
        }
      );

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('服务器返回数据格式错误');
      }

      responseContentRef.value = response.data.choices[0].message.content;
      
      try {
        // 处理可能包含的Markdown代码块
        let jsonStr = responseContentRef.value;
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }
        
        const jsonData = JSON.parse(jsonStr);
        processModelResponse(jsonData);
      } catch (error) {
        console.error('JSON解析错误：', error);
        ElMessageBox.alert('模型返回的数据格式错误，请重试。', '错误', {
          confirmButtonText: '确定',
          type: 'error',
          center: true,
          customClass: 'custom-message-box'
        });
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        ElMessageBox.alert('请求超时，请检查网络连接后重试。', '网络错误', {
          confirmButtonText: '确定',
          type: 'error',
          center: true,
          customClass: 'custom-message-box'
        });
      } else if (error.response) {
        // 服务器返回了错误状态码
        const statusCode = error.response.status;
        let errorMessage = '服务器错误';
        
        switch (statusCode) {
          case 400:
            errorMessage = '请求参数错误，请检查输入';
            break;
          case 401:
            errorMessage = 'API密钥无效或已过期';
            break;
          case 403:
            errorMessage = '没有权限访问该服务';
            break;
          case 429:
            errorMessage = '请求过于频繁，请稍后再试';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          case 503:
            errorMessage = '服务暂时不可用，请稍后再试';
            break;
          default:
            errorMessage = `服务器返回错误 (${statusCode})`;
        }
        
        ElMessageBox.alert(errorMessage, '服务器错误', {
          confirmButtonText: '确定',
          type: 'error',
          center: true,
          customClass: 'custom-message-box'
        });
      } else if (error.request) {
        // 请求已发出但没有收到响应
        ElMessageBox.alert('无法连接到服务器，请检查网络连接。', '网络错误', {
          confirmButtonText: '确定',
          type: 'error',
          center: true,
          customClass: 'custom-message-box'
        });
      } else {
        // 其他错误
        ElMessageBox.alert(`发生错误：${error.message}`, '错误', {
          confirmButtonText: '确定',
          type: 'error',
          center: true,
          customClass: 'custom-message-box'
        });
      }
      console.error('调用大模型出错：', error);
    }
  } catch (error) {
    console.error('图片处理错误：', error);
    ElMessageBox.alert('图片处理失败，请确保上传了正确的图片文件。', '错误', {
      confirmButtonText: '确定',
      type: 'error',
      center: true,
      customClass: 'custom-message-box'
    });
  } finally {
    isLoading.value = false;
    const endTime = performance.now();
    console.log(`调用大模型 ${model} 耗时：${((endTime - startTime) / 1000).toFixed(1)}秒`);
  }
};

// 处理模型返回的JSON数据
const processModelResponse = (jsonData) => {
  if (!jsonData.is_use_case_diagram) {
    ElMessageBox.alert(jsonData.error_message, '提示', {
      confirmButtonText: '确定',
      type: 'error',
      center: true,
      customClass: 'custom-message-box'
    });
    return;
  }
  
  // 更新基础数据 - 使用数组长度而不是count
  data.actor = jsonData.actor_weights.length;
  data.useCase = jsonData.usecase_weights.length;
  
  // 更新角色数据
  data.actors = jsonData.actors;
  data.actors_value = jsonData.actor_weights.map(item => item.weight);
  
  // 更新用例数据
  data.useCases = jsonData.usecases;
  data.useCases_value = jsonData.usecase_weights.map(item => item.weight);
  
  // 更新TCF值，确保有13个值
  if (!jsonData.tcf_values || !Array.isArray(jsonData.tcf_values)) {
    data.TCF_value = Array(13).fill(3); // 如果没有TCF值，使用默认值3
  } else {
    // 如果TCF值不足13个，用默认值3补充
    data.TCF_value = [...jsonData.tcf_values];
    while (data.TCF_value.length < 13) {
      data.TCF_value.push(3);
    }
    // 如果超过13个，只取前13个
    if (data.TCF_value.length > 13) {
      data.TCF_value = data.TCF_value.slice(0, 13);
    }
  }
  
  // 确保ECF值数组长度正确
  if (data.ECF_value.length !== 8) {
    data.ECF_value = Array(8).fill(3);
  }
};

// 计算工作量函数
const showEffortQwenMaxLatest = () => {
  effortQwenMaxLatest.value = calculate();
};

const showEffortQwenOcr = () => {
  effortQwenOcr.value = calculate();
};

const showEffortLlama = () => {
  effortLlama.value = calculate();
};

function calculate() {
  let UAW = data.actors_value.reduce((sum, value) => sum + value, 0);
  // console.log("UAW = " + UAW);
  let UUCW = data.useCases_value.reduce((sum, value) => sum + value, 0);
  // console.log("UUCW = " + UUCW);
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
  // console.log("TCF = " + TCF +" ECF = "+ ECF);
  let UCP = UUCP*TCF*ECF;
  // console.log("UCP = " + UCP);
  let PF = 20;
  let effort = UCP * PF;
  return effort;
}

// 处理文件上传前的验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessageBox.alert('只能上传图片文件！', '文件类型错误', {
      confirmButtonText: '确定',
      type: 'error',
      center: true,
      customClass: 'custom-message-box'
    });
    return false;
  }
  if (!isLt10M) {
    ElMessageBox.alert('图片大小不能超过 10MB！', '文件大小错误', {
      confirmButtonText: '确定',
      type: 'error',
      center: true,
      customClass: 'custom-message-box'
    });
    return false;
  }
  return true;
};

// 处理文件变化
const handleFileChange = (file) => {
  const startTime = performance.now();
  if (!file || !file.raw) {
    ElMessageBox.alert('文件获取失败，请重试。', '错误', {
      confirmButtonText: '确定',
      type: 'error',
      center: true,
      customClass: 'custom-message-box'
    });
    return;
  }

  selectedFile.value = file.raw;
  const endTime = performance.now();
  console.log(`上传图片耗时：${((endTime - startTime) / 1000).toFixed(1)}秒`);
};

const encodeImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result.split(',')[1];
      resolve(base64Image);
    };
  });
};

// 导出功能
const handleExport = async (type) => {
  const startTime = performance.now();
  if (!data.actors.length || !data.useCases.length) {
    ElMessage.warning('请先完成用例分析');
    return;
  }

  try {
    switch (type) {
      case 'pdf':
        await exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'word':
        await exportToWord();
        break;
      case 'json':
        exportToJSON();
        break;
    }
    const endTime = performance.now();
    console.log(`导出${type.toUpperCase()}耗时：${((endTime - startTime) / 1000).toFixed(1)}秒`);
  } catch (error) {
    console.error('导出失败：', error);
    ElMessage.error('导出失败，请重试');
  }
};

// 导出为PDF
const exportToPDF = async () => {
  try {
    const doc = new jsPDF({
      unit: 'pt',
      hotfixes: ['px_scaling']
    });
    
    // 设置页面边距
    const margin = 40;
    const pageWidth = doc.internal.pageSize.width;
    
    // 添加标题
    doc.setFontSize(24);
    doc.text('Use Case Analysis Report', pageWidth / 2, margin + 20, { align: 'center' });
    
    // 添加基本信息
    doc.setFontSize(12);
    let y = margin + 60;
    
    // 添加时间
    doc.text(`Analysis Time: ${new Date().toLocaleString()}`, margin, y);
    y += 30;
    
    // 添加统计信息
    doc.text(`Number of Actors: ${data.actor}`, margin, y);
    y += 20;
    doc.text(`Number of Use Cases: ${data.useCase}`, margin, y);
    y += 40;
    
    // 添加角色信息表格
    doc.setFontSize(14);
    doc.text('Actor Information:', margin, y);
    y += 25;
    
    const actorData = data.actors.map((actor, index) => [
      `Actor ${index + 1}`,
      actor,
      `Weight: ${data.actors_value[index]}`
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['No.', 'Actor Name', 'Weight']],
      body: actorData,
      margin: { left: margin },
      styles: {
        font: 'helvetica',
        fontSize: 12
      },
      headStyles: {
        font: 'helvetica',
        fontSize: 12
      }
    });
    
    y = doc.lastAutoTable.finalY + 20;
    
    // 添加用例信息表格
    doc.setFontSize(14);
    doc.text('Use Case Information:', margin, y);
    y += 25;
    
    const usecaseData = data.useCases.map((usecase, index) => [
      `Use Case ${index + 1}`,
      usecase,
      `Weight: ${data.useCases_value[index]}`
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['No.', 'Use Case Name', 'Weight']],
      body: usecaseData,
      margin: { left: margin },
      styles: {
        font: 'helvetica',
        fontSize: 12
      },
      headStyles: {
        font: 'helvetica',
        fontSize: 12
      }
    });
    
    y = doc.lastAutoTable.finalY + 20;
    
    // 添加TCF信息表格
    doc.setFontSize(14);
    doc.text('Technical Complexity Factors (TCF):', margin, y);
    y += 25;
    
    const tcfData = data.TCF_value.map((value, index) => [
      `TCF ${index + 1}`,
      value
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Factor', 'Value']],
      body: tcfData,
      margin: { left: margin },
      styles: {
        font: 'helvetica',
        fontSize: 12
      },
      headStyles: {
        font: 'helvetica',
        fontSize: 12
      }
    });
    
    y = doc.lastAutoTable.finalY + 20;
    
    // 添加ECF信息表格
    doc.setFontSize(14);
    doc.text('Environment Complexity Factors (ECF):', margin, y);
    y += 25;
    
    const ecfData = data.ECF_value.map((value, index) => [
      `ECF ${index + 1}`,
      value
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Factor', 'Value']],
      body: ecfData,
      margin: { left: margin },
      styles: {
        font: 'helvetica',
        fontSize: 12
      },
      headStyles: {
        font: 'helvetica',
        fontSize: 12
      }
    });
    
    y = doc.lastAutoTable.finalY + 20;
    
    // 添加工作量信息
    doc.setFontSize(14);
    doc.text('Effort Estimation:', margin, y);
    y += 25;
    
    const effortData = [];
    if (effortQwenMaxLatest.value) {
      effortData.push(['Qwen-VL-Max-Latest', `${effortQwenMaxLatest.value.toFixed(1)} person-hours`]);
    }
    if (effortQwenOcr.value) {
      effortData.push(['Qwen-VL-OCR-Latest', `${effortQwenOcr.value.toFixed(1)} person-hours`]);
    }
    if (effortLlama.value) {
      effortData.push(['Llama-4-Maverick', `${effortLlama.value.toFixed(1)} person-hours`]);
    }
    
    autoTable(doc, {
      startY: y,
      head: [['Model', 'Effort']],
      body: effortData,
      margin: { left: margin },
      styles: {
        font: 'helvetica',
        fontSize: 12
      },
      headStyles: {
        font: 'helvetica',
        fontSize: 12
      }
    });
    
    // 保存PDF
    doc.save('Use Case Analysis Report.pdf');
  } catch (error) {
    console.error('PDF Export Error:', error);
    ElMessage.error('PDF export failed, please try again');
    throw error;
  }
};

// 导出为Excel
const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();
  
  // 基本信息
  const basicInfo = [
    ['用例分析报告'],
    ['分析时间', new Date().toLocaleString()],
    ['角色数量', data.actor],
    ['用例数量', data.useCase],
    []
  ];
  
  // 角色信息
  const actorsData = [
    ['角色信息'],
    ['序号', '角色名称', '权重']
  ];
  data.actors.forEach((actor, index) => {
    actorsData.push([index + 1, actor, data.actors_value[index]]);
  });
  
  // 用例信息
  const usecasesData = [
    ['用例信息'],
    ['序号', '用例名称', '权重']
  ];
  data.useCases.forEach((usecase, index) => {
    usecasesData.push([index + 1, usecase, data.useCases_value[index]]);
  });
  
  // TCF信息
  const tcfData = [
    ['技术复杂度因子(TCF)'],
    ['因子', '值']
  ];
  data.TCF_value.forEach((value, index) => {
    tcfData.push([`TCF${index + 1}`, value]);
  });

  // ECF信息
  const ecfData = [
    ['环境复杂度因子(ECF)'],
    ['因子', '值']
  ];
  data.ECF_value.forEach((value, index) => {
    ecfData.push([`ECF${index + 1}`, value]);
  });
  
  // 工作量信息
  const effortData = [
    ['工作量估算'],
    ['模型', '工作量(人*时)']
  ];
  if (effortQwenMaxLatest.value) {
    effortData.push(['Qwen-VL-Max-Latest', effortQwenMaxLatest.value.toFixed(1)]);
  }
  if (effortQwenOcr.value) {
    effortData.push(['Qwen-VL-OCR-Latest', effortQwenOcr.value.toFixed(1)]);
  }
  if (effortLlama.value) {
    effortData.push(['Llama-4-Maverick', effortLlama.value.toFixed(1)]);
  }
  
  // 创建工作表
  const ws1 = XLSX.utils.aoa_to_sheet(basicInfo);
  const ws2 = XLSX.utils.aoa_to_sheet(actorsData);
  const ws3 = XLSX.utils.aoa_to_sheet(usecasesData);
  const ws4 = XLSX.utils.aoa_to_sheet(tcfData);
  const ws5 = XLSX.utils.aoa_to_sheet(ecfData);
  const ws6 = XLSX.utils.aoa_to_sheet(effortData);
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, ws1, '基本信息');
  XLSX.utils.book_append_sheet(workbook, ws2, '角色信息');
  XLSX.utils.book_append_sheet(workbook, ws3, '用例信息');
  XLSX.utils.book_append_sheet(workbook, ws4, 'TCF信息');
  XLSX.utils.book_append_sheet(workbook, ws5, 'ECF信息');
  XLSX.utils.book_append_sheet(workbook, ws6, '工作量估算');
  
  // 保存Excel文件
  XLSX.writeFile(workbook, '用例分析报告.xlsx');
};

// 导出为Word
const exportToWord = async () => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: '用例分析报告',
              bold: true,
              size: 32
            })
          ],
          alignment: 'center'
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `分析时间：${new Date().toLocaleString()}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `角色数量：${data.actor}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `用例数量：${data.useCase}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '角色信息：',
              bold: true,
              size: 24
            })
          ]
        }),
        ...data.actors.map((actor, index) => 
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${actor} (权重: ${data.actors_value[index]})`,
                size: 24
              })
            ]
          })
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: '用例信息：',
              bold: true,
              size: 24
            })
          ]
        }),
        ...data.useCases.map((usecase, index) => 
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${usecase} (权重: ${data.useCases_value[index]})`,
                size: 24
              })
            ]
          })
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: '技术复杂度因子(TCF)：',
              bold: true,
              size: 24
            })
          ]
        }),
        ...data.TCF_value.map((value, index) => 
          new Paragraph({
            children: [
              new TextRun({
                text: `TCF${index + 1}: ${value}`,
                size: 24
              })
            ]
          })
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: '环境复杂度因子(ECF)：',
              bold: true,
              size: 24
            })
          ]
        }),
        ...data.ECF_value.map((value, index) => 
          new Paragraph({
            children: [
              new TextRun({
                text: `ECF${index + 1}: ${value}`,
                size: 24
              })
            ]
          })
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: '工作量估算：',
              bold: true,
              size: 24
            })
          ]
        }),
        ...(effortQwenMaxLatest.value ? [
          new Paragraph({
            children: [
              new TextRun({
                text: `Qwen-VL-Max-Latest: ${effortQwenMaxLatest.value.toFixed(1)} 人*时`,
                size: 24
              })
            ]
          })
        ] : []),
        ...(effortQwenOcr.value ? [
          new Paragraph({
            children: [
              new TextRun({
                text: `Qwen-VL-OCR-Latest: ${effortQwenOcr.value.toFixed(1)} 人*时`,
                size: 24
              })
            ]
          })
        ] : []),
        ...(effortLlama.value ? [
          new Paragraph({
            children: [
              new TextRun({
                text: `Llama-4-Maverick: ${effortLlama.value.toFixed(1)} 人*时`,
                size: 24
              })
            ]
          })
        ] : [])
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, '用例分析报告.docx');
};

// 导出为JSON
const exportToJSON = () => {
  const reportData = {
    analysisTime: new Date().toLocaleString(),
    actorCount: data.actor,
    useCaseCount: data.useCase,
    actors: data.actors.map((actor, index) => ({
      name: actor,
      weight: data.actors_value[index]
    })),
    useCases: data.useCases.map((usecase, index) => ({
      name: usecase,
      weight: data.useCases_value[index]
    })),
    tcfValues: data.TCF_value,
    ecfValues: data.ECF_value,
    effortEstimates: {
      qwenMaxLatest: effortQwenMaxLatest.value ? effortQwenMaxLatest.value.toFixed(1) : null,
      qwenOcr: effortQwenOcr.value ? effortQwenOcr.value.toFixed(1) : null,
      llama: effortLlama.value ? effortLlama.value.toFixed(1) : null
    }
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  saveAs(blob, '用例分析报告.json');
};

// 添加角色
const addActor = () => {
  data.actors.push('');
  data.actors_value.push(1);
  data.actor = data.actors.length;
};

// 删除角色
const removeActor = (index) => {
  if (data.actors.length > 1) {
    data.actors.splice(index, 1);
    data.actors_value.splice(index, 1);
    data.actor = data.actors.length;
  }
};

// 添加用例
const addUseCase = () => {
  data.useCases.push('');
  data.useCases_value.push(5);
  data.useCase = data.useCases.length;
};

// 删除用例
const removeUseCase = (index) => {
  if (data.useCases.length > 1) {
    data.useCases.splice(index, 1);
    data.useCases_value.splice(index, 1);
    data.useCase = data.useCases.length;
  }
};
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

.model-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.call-model-btn {
  width: 60px;
  margin-top: 20px;
  margin-bottom: 0px;
  margin-left: 10px;
  min-width: 300px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calculate-btn {
  width: 60px;
  margin-bottom: 20px;
  margin-left: 10px;
  min-width: 300px;
}

.effort-result {
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
  width: 100%;
  max-width: 300px;
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

.actor-item,
.usecase-item {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.name-input {
  flex: 2;
}

.type-select {
  flex: 1;
}

:deep(.el-button.is-circle) {
  padding: 8px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.export-dropdown {
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.export-btn {
  min-width: 300px;
}

:deep(.el-dropdown-menu) {
  min-width: 150px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #ecf5ff;
  color: #409EFF;
}

:deep(.custom-message-box) {
  min-width: 400px;
  font-size: 16px;
}

:deep(.custom-message-box .el-message-box__content) {
  padding: 20px;
}

:deep(.custom-message-box .el-message-box__message) {
  font-size: 16px;
  line-height: 1.5;
}

:deep(.custom-message-box .el-message-box__btns) {
  padding: 10px 20px 20px;
}

:deep(.custom-message-box .el-button) {
  font-size: 16px;
  padding: 12px 20px;
}
</style>