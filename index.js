const spawn = require('child_process').spawn
const spawnSync = require('spawn-sync')

function tag(source, dest, opts) {
  opts = opts || {}
  return new Promise((resolve, reject) => {
    const result = spawnSync('docker', ['tag', source, dest], opts)

    if (result.status !== 0) {
      reject(result.stderr)
    } else {
      resolve(result.stdout)
    }
  })
}
/**
 * docker tag image:tag localhost:5000/image:tag
 * docker push localhost:5000/image:tag
 * push('image:tag', 'localhost:5000')
 */
module.exports = function(image, dest, opts, cb) {

  if (typeof opts === 'function') {
    cb = opts
    opts = null
  }

  opts = opts || {}

  let cmds = opts.docker || 'docker'
  const args = ['push']

  // args.push(image)

  Object.keys(opts)
    .map(key => {
      let cmd = `--${key}`
      let val = opts[key]
      cmd += val !== '' ? ` ${val}` : ''
      args.push(cmd)
    })

  args.push(dest)

  tag(image, dest)
    .then(result => {
      const process = spawn('docker', args, {})
      process.on('close', function(status) {
        if (status == 0) {
          cb && cb()
        } else {
          cb && cb(new Error("'docker push' failed with status " + status))
        }
      })
    })
    .catch(err => {
      console.log(err)
    })

}
