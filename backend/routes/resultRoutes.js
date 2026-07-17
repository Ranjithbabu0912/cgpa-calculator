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
                dob,
                forceRefresh
            } = req.body;

            if (!registerNo || !dob) {

                return res.status(400).json({
                    success: false,
                    error: 'Missing credentials'
                });
            }

            const uppercaseRegNo = registerNo.toUpperCase();

            // Check if results already exist in database and return them instantly if fresh (under 2 hours old)
            if (!forceRefresh) {
                const existingResults = await Result.find({ registerNo: uppercaseRegNo });
                if (existingResults.length > 0) {
                    const firstResult = existingResults[0];
                    const cacheAge = Date.now() - new Date(firstResult.updatedAt || 0).getTime();
                    const cacheTimeout = 2 * 60 * 60 * 1000; // 2 hours

                    if (cacheAge < cacheTimeout) {
                        const analyzeResults = require('../utils/analyzeResults');
                        const analytics = analyzeResults(existingResults);
                        return res.json({
                            success: true,
                            student: firstResult.student,
                            department: firstResult.department,
                            batch: firstResult.batch,
                            photoUrl: firstResult.photoUrl,
                            results: existingResults,
                            isCached: true,
                            ...analytics
                        });
                    }
                }
            }

            // Otherwise, scrape results from the college portal
            const result =
                await scrapeResults(
                    uppercaseRegNo,
                    dob
                );

            res.json({
                ...result,
                isCached: false
            });

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