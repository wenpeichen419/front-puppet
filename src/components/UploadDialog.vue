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

      <el-form-item label="上传文件" prop="file">
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
      form: {
        file_title: '',
        eraTag: '',
        genreTag: '',
        description: '',
        file: null
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
        ]
      },
       // 权限码常量（实际项目中应该从store或localStorage获取）
      authToken: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhbWFuZGFjaGVuXzIwMjNAcXEuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiZXhwIjoxNzU2MTAzODIxfQ.ZBtXdezUHw1QrKX5sLX6o1o9aKXOXgQH4f8I2LOrOn0'
    }
  },
  methods: {
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
      
      // 或者正确方式2：使用数组语法（适用于PHP等后端）
      // if (this.form.eraTag) formData.append('tags[]', this.form.eraTag);
      // if (this.form.genreTag) formData.append('tags[]', this.form.genreTag);
      
      formData.append('description', this.form.description);

      try {
        const response = await fetch('/api/v1/file/upload', {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthToken()
          },
          body: formData
        });

        const result = await response.json();
        console.log('上传结果:', result); // 检查返回的数据结构
        
        if (result.code === 200) {
          this.$message.success('上传成功！');
          this.dialogVisible = false;
          this.resetForm();
          this.$emit('upload-success');
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.$message.error('上传失败');
      }
    },

    // 获取权限码的方法
    getAuthToken() {
      // 实际项目中应该从Vuex store或localStorage中获取
      // 这里先用常量，但保留获取逻辑
      return this.authToken
      
      /* 实际项目中的推荐实现：
      // 从Vuex store获取
      return this.$store.state.user.token
      
      // 或从localStorage获取
      return localStorage.getItem('authToken')
      */
    },

    resetForm() {
      this.$refs.uploadForm.resetFields()
      this.fileList = []
      this.form.file = null
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
.el-upload-dragger {
  width: 100%;
}
.el-form-item {
  margin-bottom: 22px;
}
</style>