import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'pilipala_command_program',
    method: 'get',
    params
  })
}

export function partialUpdate(pk, data) {
  return request({
    url: 'pilipala_command_program' + pk,
    method: 'patch',
    data
  })
}

export function create(data) {
  return request({
    url: 'pilipala_command_program',
    method: 'post',
    data
  })
}
