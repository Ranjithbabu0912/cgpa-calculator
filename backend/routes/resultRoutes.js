const express = require('express');
const Result = require('../models/Result');

const router = express.Router();

const scrapeResults =
    require('../services/scraper');

router.post(
    '/fetch-results',
    async (req, res) => {

        try {

            const {
                registerNo,
                dob
            } = req.body;

            if (!registerNo || !dob) {

                return res.status(400).json({
                    success: false,
                    error: 'Missing credentials'
                });
            }

            const result =
                await scrapeResults(
                    registerNo,
                    dob
                );

            res.json(result);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                error:
                    error.message ||
                    'Server error'
            });
        }
    }
);

router.post(
    '/manual-results',

    async (req, res) => {

        try {

            const result =
                await Result.create(
                    req.body
                );

            res.json({

                success: true,

                result
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);

router.get(
    '/manual-results/:registerNo',

    async (req, res) => {

        try {

            const results =
                await Result.find({

                    registerNo:
                        req.params.registerNo

                });

            res.json({

                success: true,

                results
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);

router.put(
    '/manual-results/:id',

    async (req, res) => {

        try {

            const result =
                await Result.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        returnDocument: 'after'
                    }
                );

            res.json({

                success: true,

                result
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);

router.delete(
    '/manual-results/:id',

    async (req, res) => {

        try {

            await Result.findByIdAndDelete(
                req.params.id
            );

            res.json({

                success: true
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);
module.exports = router;