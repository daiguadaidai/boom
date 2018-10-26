import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'pilipala_command_program',
    method: 'get',
    params
  })
}

export function getAll(params) {
  return request({
    url: 'pilipala_host_all',
    method: 'get',
    params
  })
}
