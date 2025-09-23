<template>
  <el-dialog
    title="上传资源"
    v-model="dialogVisible"
    width="50%"
    :before-close="handleClose"
  >
    <el-form
      ref="uploadForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
    >
      <el-form-item label="文件题目" prop="file_title">
        <el-input v-model="form.file_title" placeholder="请输入文件题目"></el-input>
      </el-form-item>

      <el-form-item label="年代标签" prop="eraTag" class="tag-group">
        <el-radio-group v-model="form.eraTag">
          <el-radio label="清朝">清朝</el-radio>
          <el-radio label="民国">民国</el-radio>
          <el-radio label="现代">现代</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="题材标签" prop="genreTag" class="tag-group">
        <el-radio-group v-model="form.genreTag">
          <el-radio label="爱情">爱情</el-radio>
          <el-radio label="战争">战争</el-radio>
          <el-radio label="娱乐">娱乐</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="文件描述" prop="description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.description"
          placeholder="请输入文件描述"
        ></el-input>
      </el-form-item>

      <el-form-item label="上传资源文件" prop="file">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">可以上传任意类型的资源</div>
        </el-upload>
      </el-form-item>

      <!-- 修改：上传资源封面图（必填） -->
      <el-form-item label="上传资源封面图（tips：图片类型的资源不需要上传资源封面图）" prop="coverFile" class="cover-upload">
        <div class="cover-upload-tip" v-if="isImageFile">
          <el-alert
            title="图片类型资源将自动使用文件本身作为封面图"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
        <el-upload
          class="cover-upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleCoverChange"
          :on-remove="handleCoverRemove"
          :file-list="coverFileList"
          :limit="1"
          :disabled="isImageFile"
          :accept="isImageFile ? '' : 'image/*'"
        >
          <template v-if="isImageFile && fileList.length > 0">
            <i class="el-icon-picture"></i>
            <div class="el-upload__text">
              <em>已自动设置为资源文件</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              图片资源将使用文件本身作为封面图
            </div>
          </template>
          <template v-else>
            <i class="el-icon-picture"></i>
            <div class="el-upload__text">将封面图拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              支持 JPG、PNG 等图片格式，建议尺寸 300x400
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm">确认上传</el-button>
    </span>
  </el-dialog>
</template>

<script>
import axios from 'axios'
export default {
  name: 'UploadDialog',
  data() {
    return {
      dialogVisible: false,
      fileList: [],
      coverFileList: [],
      form: {
        file_title: '',
        eraTag: '',
        genreTag: '',
        description: '',
        file: null,
        coverFile: null // 新增：封面图文件
      },
      rules: {
        file_title: [
          { required: true, message: '请输入文件题目', trigger: 'blur' }
        ],
        eraTag: [
          { required: true, message: '请选择年代标签', trigger: 'change' }
        ],
        genreTag: [
          { required: true, message: '请选择题材标签', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入文件描述', trigger: 'blur' }
        ],
        file: [
          { required: true, message: '请上传文件', trigger: 'change' }
        ],
        // 修改：封面图改为必填项
        coverFile: [
          { 
            required: true, 
            validator: this.validateCoverFile, 
            trigger: 'change' 
          }
        ]
      }
    }
  },
  computed: {
    // 从localStorage获取存储在cookie键下的token
    authToken() {
      return localStorage.getItem("cookie") || '';
    },
    // 判断上传的文件是否为图片类型
    isImageFile() {
      if (!this.form.file) return false;
      
      const fileName = this.form.file.name.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      return imageExtensions.some(ext => fileName.endsWith(ext));
    }
  },
  methods: {
    // 新增：封面图验证器
    validateCoverFile(rule, value, callback) {
      // 如果是图片类型文件，自动有封面图，验证通过
      if (this.isImageFile) {
        callback();
        return;
      }
      
      // 非图片类型文件需要手动上传封面图
      if (!this.form.coverFile) {
        callback(new Error('请上传资源封面图'));
      } else {
        callback();
      }
    },
    
    openDialog() {
      console.log('openDialog方法被调用')
      this.dialogVisible = true
      console.log('dialogVisible状态:', this.dialogVisible)
    },
    handleClose(done) {
      this.$confirm('确认关闭？上传内容将不会被保存', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.resetForm()
        done()
      }).catch(() => {})
    },
    handleFileChange(file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]] // 只保留最新上传的文件
        this.form.file = file.raw
        
        // 如果新上传的文件是图片类型，自动设置封面图为同一文件
        if (this.isImageFile) {
          // 创建封面图文件的副本（避免引用同一对象）
          const coverFileCopy = new File([this.form.file], this.form.file.name, {
            type: this.form.file.type,
            lastModified: this.form.file.lastModified
          });
          
          this.form.coverFile = coverFileCopy;
          this.coverFileList = [{
            name: file.name,
            size: file.size,
            raw: coverFileCopy
          }];
          
          // 触发封面图验证（图片类型自动通过验证）
          this.$nextTick(() => {
            this.$refs.uploadForm.validateField('coverFile');
          });
        } else {
          // 非图片类型文件，清除封面图
          this.coverFileList = []
          this.form.coverFile = null
          
          // 触发封面图验证（非图片类型需要手动上传）
          this.$nextTick(() => {
            this.$refs.uploadForm.validateField('coverFile');
          });
        }
      } else {
        // 清空文件时也清空封面图
        this.coverFileList = []
        this.form.coverFile = null
        this.$nextTick(() => {
          this.$refs.uploadForm.validateField('coverFile');
        });
      }
    },
    // 新增：处理封面图上传（仅对非图片类型文件有效）
    handleCoverChange(file, fileList) {
      if (fileList.length > 0 && !this.isImageFile) {
        this.coverFileList = [fileList[fileList.length - 1]] // 只保留最新上传的文件
        this.form.coverFile = file.raw
        
        // 触发验证
        this.$nextTick(() => {
          this.$refs.uploadForm.validateField('coverFile');
        });
      }
    },
    // 新增：处理封面图删除
    handleCoverRemove(file, fileList) {
      if (!this.isImageFile) {
        this.coverFileList = fileList
        this.form.coverFile = fileList.length > 0 ? fileList[0].raw : null
        
        // 触发验证
        this.$nextTick(() => {
          this.$refs.uploadForm.validateField('coverFile');
        });
      }
    },
    submitForm() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.uploadFile()
        } else {
          return false
        }
      })
    },
    async uploadFile() {
      const formData = new FormData();
      formData.append('file', this.form.file);
      formData.append('file_title', this.form.file_title);
      
      // 正确方式1：直接添加多个同名字段（适用于大多数后端框架）
      if (this.form.eraTag) formData.append('tags', this.form.eraTag);
      if (this.form.genreTag) formData.append('tags', this.form.genreTag);
      
      formData.append('description', this.form.description);
      
      // 新增：如果有封面图，添加到表单数据
      // 图片类型资源会自动使用文件本身作为封面图
      if (this.form.coverFile) {
        formData.append('cover', this.form.coverFile);
      }

      try {
        const response = await fetch('http://8.134.51.50:6060/api/v1/file/upload', {
          method: 'POST',
          headers: {
            'Authorization': this.authToken // 直接使用计算属性
          },
          body: formData
        });

        const result = await response.json();
        console.log('上传结果:', result);
        
        if (result.code === 200) {
          this.$message.success('上传成功！');
          this.dialogVisible = false;
          this.resetForm();
          this.$emit('upload-success');
        } else {
          this.$message.error(`上传失败: ${result.message || '未知错误'}`);
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.$message.error('上传失败');
      }
    },

    resetForm() {
      this.$refs.uploadForm.resetFields()
      this.fileList = []
      this.coverFileList = []
      this.form.file = null
      this.form.coverFile = null
    }
  }
}
</script>

<style scoped>
.tag-group {
  margin-bottom: 20px;
}
.upload-demo {
  width: 100%;
}
.cover-upload-demo {
  width: 100%;
}
.el-upload-dragger {
  width: 100%;
}
.el-form-item {
  margin-bottom: 22px;
}
.cover-upload-tip {
  margin-bottom: 10px;
}
.cover-upload-demo .el-upload-dragger {
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
}
.cover-upload-demo .el-upload-dragger.is-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 为必填项添加星号标识 */
.el-form-item.is-required .el-form-item__label::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>