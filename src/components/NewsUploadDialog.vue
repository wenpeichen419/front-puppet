<template>
  <el-dialog v-model="dialogVisible" title="上传新闻" width="500px" @close="resetForm">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="5"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'NewsUploadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'upload-success'],
  data() {
    return {
      form: {
        title: '',
        content: '',
        author: '',
        description: ''
      },
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.formRef.resetFields();
    },
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            const response = await fetch('http://8.134.51.50:6060/api/v1/article', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("cookie"),
              },
              body: JSON.stringify(this.form)
            });
            const result = await response.json();
            if (result.code >= 200 && result.code < 300) {
              ElMessage.success('新闻上传成功');
              this.$emit('upload-success');
              this.dialogVisible = false;
            } else {
              ElMessage.error('新闻上传失败: ' + (result.message || '未知错误'));
            }
          } catch (error) {
            ElMessage.error('上传出错: ' + (error.message || '未知错误'));
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
