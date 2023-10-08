const express = require('express');
const axios = require('axios');
const _ = require('lodash');


const app = express();

app.use(express.json())


const getBlogsData =_.memoize(async () => {
    const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
    const headers = {
        'x-hasura-admin-secret':process.env.X_HASURA_ADMIN_SECRET
    }
    try{
        const data = await axios.get(apiUrl, {headers: headers})
        return data.data;
    }catch(error){
        return error
    }
}
)

const filterDataUsingQuery = _.memoize(async(query) => {
    const data = await getBlogsData();
    if (data instanceof Error) return data;
   return (data.blogs.filter(blog => blog.title.toLowerCase().includes(query)));
});


app.get('/api/blog-stats', async (req, res)=>{
    try{
        const data = await getBlogsData();
        if (data instanceof Error) {
            res.status(500).json({
                error: 'An error occurred while fetching data'
            });
        }else{
            const totalBlogs = _.size(data.blogs);
            const blogWithLongestTitle = _.maxBy(data.blogs, blog => blog.title.length);
            const numberOfBlogsWithPrivacy = data.blogs.filter(blog => blog.title.toLowerCase().includes("privacy")).length;
            const uniqueBlogTitles = [...new Set(data.blogs.map(blog => blog.title))];
        
            res.status(200).json({
                data:{
                    totalBlogs,
                    titleOfLongestBlog:blogWithLongestTitle.title,
                    numberOfBlogsWithPrivacy,
                    uniqueBlogTitles
                }
            })
        }
    

    } catch (error){
        res.status(500).json({
            error: 'An error occurred while processing the request'
        })
    }

});


app.get('/api/blog-search', async (req,res)=>{
    try{
        const query = req.query.query;
        if(_.isEmpty(query)){
            res.status(400).json({
                message:'query parameter is empty'
            })
        }
        let filterData = await filterDataUsingQuery(query);
        if(filterData instanceof Error){
            res.status(500).json({
                error: 'An error occurred while processing the request'
            })
        }
        if(filterData.length === 0){
            res.status(200).json({
                filterData,
                message:'no maching blogs found!'
            })
        }else{
            res.send({
                filterData:filterData
            })
        }
    }catch(error){
        res.status(500).json({
            error: 'An error occurred while processing the request'
        })
    }


})

module.exports = app;