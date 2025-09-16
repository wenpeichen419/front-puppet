<template>
  <el-dialog
    title="上传视频"
    v-model="dialogVisible"
    width="60%"
    :before-close="handleClose"
    custom-class="video-upload-dialog"
  >
    <el-form
      ref="uploadForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
    >
      <el-form-item label="视频标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入视频标题"></el-input>
      </el-form-item>

      <el-form-item label="视频描述" prop="description">
        <el-input
          type="textarea"
          :rows="3"
          v-model="form.description"
          placeholder="请输入视频描述"
        ></el-input>
      </el-form-item>

      <el-form-item label="视频封面" prop="cover">
        <div 
          class="cover-upload-area"
          :class="{ 'drag-over': isDragOverCover }"
          @drop="handleCoverDrop"
          @dragover="handleCoverDragOver"
          @dragleave="handleCoverDragLeave"
          @click="triggerCoverFileInput"
        >
          <div v-if="!coverPreview" class="upload-placeholder">
            <i class="el-icon-picture-outline"></i>
            <div class="upload-text">点击或拖拽图片到此处上传封面</div>
            <div class="upload-tip">支持 jpg、png、gif 等图片格式</div>
          </div>
          <div v-else class="cover-preview">
            <img :src="coverPreview" alt="封面预览" />
            <div class="cover-overlay">
              <el-button type="danger" size="small" @click.stop="removeCover">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
        </div>
        <input
          ref="coverFileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleCoverFileChange"
        />
      </el-form-item>

      <el-form-item label="视频文件" prop="video_file">
        <div 
          class="video-upload-area"
          :class="{ 'drag-over': isDragOverVideo }"
          @drop="handleVideoDrop"
          @dragover="handleVideoDragOver"
          @dragleave="handleVideoDragLeave"
          @click="triggerVideoFileInput"
        >
          <div v-if="!videoInfo.name" class="upload-placeholder">
            <i class="el-icon-video-camera"></i>
            <div class="upload-text">点击或拖拽视频到此处上传</div>
            <div class="upload-tip">支持 mp4 格式视频文件</div>
          </div>
          <div v-else class="video-info">
            <div class="video-details">
              <i class="el-icon-video-camera"></i>
              <div class="file-info">
                <div class="file-name">{{ videoInfo.name }}</div>
                <div class="file-size">{{ formatFileSize(videoInfo.size) }}</div>
              </div>
            </div>
            <el-button type="danger" size="small" @click.stop="removeVideo">
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
        </div>
        <input
          ref="videoFileInput"
          type="file"
          accept="video/mp4"
          style="display: none"
          @change="handleVideoFileChange"
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="uploading">确认上传</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'VideoUploadDialog',
  data() {
    return {
      dialogVisible: false,
      uploading: false,
      isDragOverCover: false,
      isDragOverVideo: false,
      coverPreview: null,
      videoInfo: {
        name: '',
        size: 0
      },
      form: {
        title: '',
        description: '',
        cover: null,
        video_file: null
      },
      rules: {
        title: [
          { required: true, message: '请输入视频标题', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入视频描述', trigger: 'blur' }
        ],
        cover: [
          { required: true, message: '请上传视频封面', trigger: 'change' }
        ],
        video_file: [
          { required: true, message: '请上传视频文件', trigger: 'change' }
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
      console.log('VideoUploadDialog 打开')
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
    
    // 封面上传相关方法
    triggerCoverFileInput() {
      this.$refs.coverFileInput.click()
    },
    handleCoverFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.processCoverFile(file)
      }
    },
    handleCoverDragOver(event) {
      event.preventDefault()
      this.isDragOverCover = true
    },
    handleCoverDragLeave(event) {
      event.preventDefault()
      this.isDragOverCover = false
    },
    handleCoverDrop(event) {
      event.preventDefault()
      this.isDragOverCover = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          this.processCoverFile(file)
        } else {
          this.$message.error('请上传图片文件')
        }
      }
    },
    processCoverFile(file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.$message.error('请上传图片文件')
        return
      }
      
      // 验证文件大小 (限制5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('封面图片大小不能超过5MB')
        return
      }
      
      this.form.cover = file
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.coverPreview = e.target.result
      }
      reader.readAsDataURL(file)
      
      // 触发验证
      this.$nextTick(() => {
        this.$refs.uploadForm.validateField('cover')
      })
    },
    removeCover() {
      this.form.cover = null
      this.coverPreview = null
      this.$refs.coverFileInput.value = ''
      this.$refs.uploadForm.validateField('cover')
    },
    
    // 视频上传相关方法
    triggerVideoFileInput() {
      this.$refs.videoFileInput.click()
    },
    handleVideoFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.processVideoFile(file)
      }
    },
    handleVideoDragOver(event) {
      event.preventDefault()
      this.isDragOverVideo = true
    },
    handleVideoDragLeave(event) {
      event.preventDefault()
      this.isDragOverVideo = false
    },
    handleVideoDrop(event) {
      event.preventDefault()
      this.isDragOverVideo = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type === 'video/mp4') {
          this.processVideoFile(file)
        } else {
          this.$message.error('请上传MP4格式的视频文件')
        }
      }
    },
    processVideoFile(file) {
      // 验证文件类型
      if (file.type !== 'video/mp4') {
        this.$message.error('请上传MP4格式的视频文件')
        return
      }
      
      // 验证文件大小 (限制100MB)
      if (file.size > 1024 * 1024 * 1024) {
        this.$message.error('视频文件大小不能超过1GB')
        return
      }
      
      this.form.video_file = file
      this.videoInfo = {
        name: file.name,
        size: file.size
      }
      
      // 触发验证
      this.$nextTick(() => {
        this.$refs.uploadForm.validateField('video_file')
      })
    },
    removeVideo() {
      this.form.video_file = null
      this.videoInfo = {
        name: '',
        size: 0
      }
      this.$refs.videoFileInput.value = ''
      this.$refs.uploadForm.validateField('video_file')
    },
    
    // 工具方法
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // 表单提交
    submitForm() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.uploadVideo()
        } else {
          return false
        }
      })
    },
    async uploadVideo() {
      ElMessage.info("开始上传视频")
      this.uploading = true
      const formData = new FormData()
      
      // 添加表单数据
      formData.append('title', this.form.title)
      formData.append('description', this.form.description)
      formData.append('cover', this.form.cover)
      formData.append('video_file', this.form.video_file)

      try {
        const response = await fetch('http://8.134.51.50:6060/api/v1/opera', {
          method: 'POST',
          headers: {
            'Authorization': this.authToken
          },
          body: formData
        })

        const result = await response.json()
        console.log('上传结果:', result)
        
        if (result.code >= 200 && result.code < 300) {
          this.$message.success('视频上传成功！')
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
      this.form.cover = null
      this.form.video_file = null
      this.coverPreview = null
      this.videoInfo = {
        name: '',
        size: 0
      }
      this.$refs.coverFileInput.value = ''
      this.$refs.videoFileInput.value = ''
    }
  }
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
}

.el-form-item {
  margin-bottom: 22px;
}

.cover-upload-area,
.video-upload-area {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafbfc;
}

.cover-upload-area:hover,
.video-upload-area:hover {
  border-color: #409eff;
}

.drag-over {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-placeholder {
  text-align: center;
  color: #909399;
}

.upload-placeholder i {
  font-size: 28px;
  margin-bottom: 8px;
  display: block;
}

.upload-text {
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #c0c4cc;
}

.cover-preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.cover-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.video-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.video-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-details i {
  font-size: 24px;
  color: #409eff;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}
</style>

<style>
/* 设置对话框的最大高度和滚动 */
.video-upload-dialog {
  max-height: 80vh;
  overflow-y: scroll;
}

.video-upload-dialog .el-dialog__body {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  padding: 20px;
}

.video-upload-dialog .el-dialog__header {
  padding: 20px 20px 10px;
}

.video-upload-dialog .el-dialog__footer {
  padding: 10px 20px 20px;
}
</style>