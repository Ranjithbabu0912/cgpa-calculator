const express = require('express');

const axios = require('axios');

const router = express.Router();

router.get(

    '/student-photo/:id',

    async (req, res) => {

        try {

            const { id } = req.params;

            const response =
                await axios.get(

                    `http://117.240.157.45/CMSAPP/api/User/Account/Photo/Student/${id}`,

                    {
                        responseType:
                            'arraybuffer'
                    }
                );

            res.set(

                'Content-Type',

                response.headers['content-type']
            );

            res.send(response.data);

        } catch (error) {

            console.log(error);

            res.status(404).send(
                'Image not found'
            );
        }
    }
);

module.exports = router;