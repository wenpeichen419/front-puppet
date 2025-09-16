<template>
  <el-dialog
    title="上传剧本"
    v-model="dialogVisible"
    width="60%"
    :before-close="handleClose"
    custom-class="script-upload-dialog"
  >
    <el-form
      ref="uploadForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
    >
      <el-form-item label="剧本标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入剧本标题"></el-input>
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者姓名"></el-input>
      </el-form-item>

      <el-form-item label="剧本描述" prop="description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.description"
          placeholder="请输入剧本描述"
        ></el-input>
      </el-form-item>

      <el-form-item label="剧本文件" prop="script_file">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleScriptFileChange"
          :file-list="scriptFileList"
          :limit="1"
          accept=".txt,.doc,.docx,.pdf"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将剧本文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">支持 txt、doc、docx、pdf 格式</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="剧本图片">
        <div class="image-upload-section">
          <div
            v-for="(imageItem, index) in form.image_files"
            :key="index"
            class="image-upload-item"
          >
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :on-change="(file, fileList) => handleImageFileChange(file, fileList, index)"
              :file-list="imageItem.fileList"
              :limit="1"
              accept="image/*"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">图片 {{ index + 1 }}</div>
              <div class="el-upload__tip" slot="tip">支持 jpg、png、gif 等图片格式</div>
            </el-upload>
            <el-button
              v-if="form.image_files.length > 1"
              type="danger"
              size="small"
              icon="el-icon-delete"
              class="remove-image-btn"
              @click="removeImageFile(index)"
              circle
            ></el-button>
          </div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="add-image-btn"
            @click="addImageFile"
            circle
          ></el-button>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="uploading">确认上传</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ScriptUploadDialog',
  data() {
    return {
      dialogVisible: false,
      uploading: false,
      scriptFileList: [],
      form: {
        title: '',
        author: '',
        description: '',
        script_file: null,
        image_files: [
          {
            file: null,
            fileList: []
          }
        ]
      },
      rules: {
        title: [
          { required: true, message: '请输入剧本标题', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者姓名', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入剧本描述', trigger: 'blur' }
        ],
        script_file: [
          { required: true, message: '请上传剧本文件', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    authToken() {
      return localStorage.getItem("cookie") || '';
    }
  },
  methods: {
    openDialog() {
      console.log('ScriptUploadDialog 打开')
      this.dialogVisible = true
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
    handleScriptFileChange(file, fileList) {
      if (fileList.length > 0) {
        this.scriptFileList = [fileList[fileList.length - 1]]
        this.form.script_file = file.raw
      }
    },
    handleImageFileChange(file, fileList, index) {
      if (fileList.length > 0) {
        this.form.image_files[index].fileList = [fileList[fileList.length - 1]]
        this.form.image_files[index].file = file.raw
      }
    },
    addImageFile() {
      this.form.image_files.push({
        file: null,
        fileList: []
      })
    },
    removeImageFile(index) {
      if (this.form.image_files.length > 1) {
        this.form.image_files.splice(index, 1)
      }
    },
    submitForm() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.uploadScript()
        } else {
          return false
        }
      })
    },
    async uploadScript() {
      this.uploading = true
      const formData = new FormData()
      
      // 添加基本信息
      formData.append('title', this.form.title)
      formData.append('author', this.form.author)
      formData.append('description', this.form.description)
      
      // 添加剧本文件
      if (this.form.script_file) {
        formData.append('script_file', this.form.script_file)
      }
      
      // 添加图片文件
      this.form.image_files.forEach((imageItem) => {
        if (imageItem.file) {
          formData.append('image_files', imageItem.file)
        }
      })

      try {
        const response = await fetch('http://8.134.51.50:6060/api/v1/script/upload', {
          method: 'POST',
          headers: {
            'Authorization': this.authToken
          },
          body: formData
        })

        const result = await response.json()
        console.log('上传结果:', result)
        
        if (result.code >= 200 && result.code < 300) {
          this.$message.success('剧本上传成功！')
          this.dialogVisible = false
          this.resetForm()
          this.$emit('upload-success')
        } else {
          this.$message.error(result.detail || '上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('网络错误，上传失败')
      } finally {
        this.uploading = false
      }
    },
    resetForm() {
      this.$refs.uploadForm.resetFields()
      this.scriptFileList = []
      this.form.script_file = null
      this.form.image_files = [
        {
          file: null,
          fileList: []
        }
      ]
    }
  }
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
}

.el-form-item {
  margin-bottom: 22px;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-upload-item {
  position: relative;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafbfc;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.add-image-btn {
  align-self: center;
  margin-top: 16px;
}

.dialog-footer {
  text-align: right;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>

<style>
.script-upload-dialog {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.script-upload-dialog .el-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.script-upload-dialog .el-dialog__header {
  padding: 20px 20px 10px;
}

.script-upload-dialog .el-dialog__footer {
  padding: 10px 20px 20px;
}
</style>