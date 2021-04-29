// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const unirest = require('unirest')
// eslint-disable-next-line no-unused-vars
const { exec } = require ( 'child_process' )
const path = require ( 'path' )
const fs = require('fs-extra')
const slash = require ( 'slash' )
module.exports = (options = {}) => {
  return async context => {
    
    
    if ( context.data.project ){
      const workspace = slash(path.resolve ( '../workspace/' ))
      fs.copyFileSync ( slash(path.resolve ( workspace , context.data.project ) + '/config/config.js') ,  slash(workspace + '/config.js' ) )
    
      process.chdir( path.resolve ( "../" , "whoobe-nuxt/" ) )
      const myShellScript = exec("yarn generate");
      myShellScript.stdout.on('data', (data)=>{

        context.app.service('generate').create({ data: data})
        // do whatever you want here with data
      });
      myShellScript.stderr.on('data', (data)=>{
        context.app.service('generate').create({ error: data})
        console.error(data);
      });
      myShellScript.on('exit' , (data) => {
        console.log ( 'Generation done' , data )
        context.app.service('generate').create({ data: 'Whoobe Site Generation done!\n' } )
        context.app.service('generate').create ( { data: 'done\n'} )

        fs.removeSync( path.resolve ( workspace , context.data.project ) + '/dist/uploads'  )
        if ( context.data.uploads ){
          context.app.service('generate').create ( { data: 'Uploading ' + context.data.uploads.length + ' assets ...\n'} )
          let errors = 0
          context.data.uploads.forEach ( (image,i) => {
            fs.copy ( path.resolve( context.app.get('public') ) + image , path.resolve ( workspace , context.data.project ) + '/dist' + image ).then ( () => {
              context.app.service('generate').create ( { data: image + ' uploaded.\n'} )
            })
            .catch(err => {
              context.app.service('generate').create ( { error: 'Upload error ' + image + '\n' } )
              console.error(err)
              errors++
            })
          })
        }
        
        
        // fs.copy( path.resolve( context.app.get('uploads') ) , path.resolve ( workspace , context.data.project ) + '/dist/uploads' )
        //     .then(() => {
        //       context.app.service('generate').create ( { data: 'Assets imported !\n'} )
        //       context.app.service('generate').create ( { data: 'done'} )
        //       console.log ( context.data.uploads )
        //     })
        //     .catch(err => {
        //       context.app.service('generate').create ( { error: 'Error importing assets' } )
        //       console.error(err)
        //     })
      })
    }
    return context
    
    
  };
};
