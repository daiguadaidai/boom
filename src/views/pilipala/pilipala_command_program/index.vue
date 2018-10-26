<template>
  <div class="app-container">
    <div class="el-row">
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addCommandDialog()">添加</el-button>
    </div>

    <br>

    <div class="el-row">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="正在加载..."
        border
        fit
        highlight-current-row>
        <el-table-column align="center" label="序号" width="95" fixed>
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="标题" width="200">
          <template slot-scope="scope">
            {{ scope.row.Title }}
          </template>
        </el-table-column>
        <el-table-column label="文件名" width="200" align="center">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.FileName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用专用机器" width="200" align="center">
          <template slot-scope="scope">
            {{ scope.row.HaveDedicate | haveDedicateFilter }}
          </template>
        </el-table-column>
        <el-table-column label="命令参数" width="500" align="center">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.Params }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新" width="200" prop="created_at" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"/>
            {{ scope.row.UpdatedAt | parseTime }}
          </template>
        </el-table-column>
        <el-table-column label="创建" width="200" prop="created_at" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"/>
            <span>{{ scope.row.CreatedAt | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="editDialog(scope.$index, scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <br>

    <div class="el-row">
      <el-dialog
        v-loading="createLoading"
        :visible.sync="dialogCreateFormVisible"
        element-loading-text="正在创建..."
        title="创建">
        <el-form ref="createValidateForm" :model="createForm">
          <el-form-item
            :label-width="formLabelWidth"
            :rules="[{required:true, message: '标题不能为空'}]"
            prop="title"
            label="标题">
            <el-input v-model="createForm.Title" autocomplete="off">{{ createForm.Title }}</el-input>
          </el-form-item>
          <el-form-item :label-width="formLabelWidth" prop="command" label="命令文件">
            <el-upload
              :file-list="createForm.FileList"
              :action="uploadCreateFileURL"
              :on-success="uploadCreateFileSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item :label-width="formLabelWidth" prop="params" label="命令参数">
            <el-input v-model="createForm.Prams" type="textarea" autocomplete="off">{{ createForm.Params }}</el-input>
          </el-form-item>
          <el-form-item :label-width="formLabelWidth" label="使用专用机器">
            <template>
              <el-radio-group v-model="createForm.HaveDedicate" @change="createHaveDedicateChange">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </template>
          </el-form-item>
          <el-form-item
            v-if="createForm.HaveDedicate === 1"
            :label-width="formLabelWidth"
            label="专用机器">
            <template>
              <el-select
                v-model="createForm.DedicateHosts"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择专用机器">
                <el-option v-for="item in dedicateHosts" :key="item.Id" :label="item.Host" :value="item.Id"/>
              </el-select>
            </template>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogCreateFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitCreateForm('createValidateForm')">创 建</el-button>
        </div>
      </el-dialog>
    </div>

    <br>

    <div class="el-row">
      <el-dialog
        v-loading="listLoading"
        :visible.sync="dialogEditFormVisible"
        element-loading-text="正在编辑..."
        title="编辑">
        <el-form ref="editValidateForm" :model="editForm">
          <el-form-item
            :label-width="formLabelWidth"
            :rules="[{required:true, message: '标题不能为空'}]"
            prop="title"
            label="名称">
            <el-input v-model="editForm.Title" autocomplete="off">{{ editForm.Title }}</el-input>
          </el-form-item>
          <el-form-item
            :label-width="formLabelWidth"
            prop="params"
            label="路径">
            <el-input v-model="editForm.Prams" autocomplete="off">{{ editForm.Params }}</el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm('editValidateForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import { getList, partialUpdate } from '@/api/pilipala_command_program'
import { getAll } from '@/api/pilipala_host'

export default {
  filters: {
    haveDedicateFilter(status) {
      const statusMap = {
        0: '否',
        1: '是'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      createLoading: false,
      editLoading: false,
      dialogCreateFormVisible: false,
      dialogEditFormVisible: false,
      formLabelWidth: '100px',
      editRowIndex: '',
      dedicateHosts: null,
      uploadCreateFileURL: process.env.BASE_API + '/pilipala_command_program/upload_command',
      uploadCreateFileList: [],
      createForm: {
        Title: '',
        Params: '',
        HaveDedicate: 0,
        FileName: '',
        TmpFileName: '',
        DedicateHosts: []
      },
      editForm: {
        Id: '',
        Title: '',
        Params: '',
        HaveDedicate: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    editDialog(index, row) {
      this.editRowIndex = index
      this.edit.Form.Id = row.Id
      this.edit.Form.Title = row.Title
      this.edit.Form.Params = row.Params
      this.edit.Form.HaveDedicate = row.HaveDedicate
      this.dialogEditFormVisible = true
    },
    submitEditDirForm(editDirValidateForm) {
      this.$refs.editValidateForm.validate((valid) => {
        if (valid) {
          // this.editLoading = true
          this.listLoading = true
          console.log(this.listLoading, this.editLoading)
          partialUpdate(this.form.id, this.form).then(response => {
            this.list[this.editRowIndex].Title = this.editForm.title
            this.list[this.editRowIndex].Params = this.editForm.Params
            this.list[this.editRowIndex].HaveDedicate = this.editForm.HaveDedicate
            this.$notify({
              title: '成功',
              message: '编辑成功(' + this.form.title + ')',
              type: 'success',
              position: 'top-left'
            })
            this.dialogFormVisible = false
          })
          this.listLoading = false
        } else {
          return false
        }
      })
    },
    addCommandDialog() {
      this.dialogCreateFormVisible = true
      this.createForm.HaveDedicate = 0
    },
    uploadCreateFileSuccess(response, file, fileList) {
      this.createForm.FileName = response.data.FileName
      this.createForm.TmpFileName = response.data.TmpFileName
    },
    createHaveDedicateChange() {
      if (this.createForm.HaveDedicate === 1) {
        if (this.dedicateHosts === null) {
          const params = {
            columnStr: 'id,host',
            isDedicate: 0
          }
          getAll(params).then(response => {
            this.dedicateHosts = response.data.items
            console.log(this.dedicateHosts)
          })
        }
      }
    }
  }
}
</script>
